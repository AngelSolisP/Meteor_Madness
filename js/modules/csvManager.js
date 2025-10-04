// js/modules/csvManager.js

class CSVManager {
    constructor() {
        this.storageKey = 'meteor_scenarios';
        this.scenarios = this.loadFromStorage();
    }

    // Guardar nuevo escenario
    saveScenario(scenarioData) {
        const scenario = {
            id: Date.now().toString(),
            name: scenarioData.name || `Escenario ${this.scenarios.length + 1}`,
            timestamp: new Date().toISOString(),
            parameters: scenarioData.parameters,
            results: scenarioData.results,
            location: scenarioData.location
        };

        this.scenarios.unshift(scenario); // Agregar al inicio
        this.saveToStorage();
        
        console.log('💾 Escenario guardado:', scenario.name);
        return scenario;
    }

    // Obtener todos los escenarios
    getScenarios() {
        return this.scenarios;
    }

    // Eliminar escenario
    deleteScenario(scenarioId) {
        this.scenarios = this.scenarios.filter(s => s.id !== scenarioId);
        this.saveToStorage();
        console.log('🗑️ Escenario eliminado:', scenarioId);
    }

    // Exportar a CSV
    exportToCSV() {
        if (this.scenarios.length === 0) {
            alert('No hay escenarios guardados para exportar');
            return;
        }

        const headers = ['Nombre', 'Diámetro (m)', 'Velocidad (km/s)', 'Energía (MT)', 'Ubicación', 'Fecha'];
        const csvData = this.scenarios.map(scenario => [
            scenario.name,
            scenario.parameters.diameter,
            scenario.parameters.velocity,
            scenario.results.energy,
            scenario.location.name,
            new Date(scenario.timestamp).toLocaleDateString('es-ES')
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        this.downloadCSV(csvContent, `meteor_scenarios_${Date.now()}.csv`);
    }

    // Importar desde CSV
    async importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',');
                    
                    const importedScenarios = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        
                        const values = lines[i].split(',');
                        const scenario = {
                            id: Date.now().toString() + i,
                            name: values[0] || `Escenario Importado ${i}`,
                            timestamp: new Date().toISOString(),
                            parameters: {
                                diameter: parseFloat(values[1]) || 100,
                                velocity: parseFloat(values[2]) || 15,
                                angle: 45,
                                composition: 'rocky'
                            },
                            results: {
                                energy: parseFloat(values[3]) || 1000,
                                crater: 0,
                                seismic: 0,
                                destruction: 0
                            },
                            location: {
                                name: values[4] || 'Ubicación desconocida',
                                lat: 0,
                                lon: 0
                            }
                        };
                        
                        importedScenarios.push(scenario);
                    }
                    
                    this.scenarios = [...this.scenarios, ...importedScenarios];
                    this.saveToStorage();
                    
                    console.log('📥 Escenarios importados:', importedScenarios.length);
                    resolve(importedScenarios);
                    
                } catch (error) {
                    reject(new Error('Error procesando archivo CSV'));
                }
            };
            
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    }

    // Descargar archivo CSV
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Storage local
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading scenarios:', error);
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scenarios));
        } catch (error) {
            console.error('Error saving scenarios:', error);
        }
    }
}
