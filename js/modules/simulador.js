// js/modules/simulator.js

class MeteorSimulator {
    constructor() {
        this.apiManager = new APIManager();
        this.csvManager = new CSVManager();
        this.currentScenario = null;
        this.isSimulating = false;
        
        this.initializeEventListeners();
        this.loadSavedScenarios();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Sliders de parámetros
        this.setupSliders();
        
        // Botones de acción
        this.setupActionButtons();
        
        // Tabs del simulador
        this.setupTabs();
        
        // Selector de ubicación
        this.setupLocationSelector();
    }

    // Configurar sliders
    setupSliders() {
        const sliders = ['diameter', 'velocity', 'angle'];
        
        sliders.forEach(param => {
            const slider = document.getElementById(`${param}-slider`);
            const valueDisplay = document.getElementById(`${param}-value`);
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    valueDisplay.textContent = e.target.value;
                    this.updatePreview();
                });
            }
        });
    }

    // Configurar botones de acción
    setupActionButtons() {
        // Simular impacto
        const simulateBtn = document.getElementById('simulate-impact');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.runSimulation());
        }

        // Reiniciar
        const resetBtn = document.getElementById('reset-simulation');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSimulation());
        }

        // Guardar escenario
        const saveBtn = document.getElementById('save-scenario');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentScenario());
        }

        // Cargar datos NASA
        const nasaBtn = document.getElementById('load-nasa-data');
        if (nasaBtn) {
            nasaBtn.addEventListener('click', () => this.loadNASAData());
        }

        // Importar/Exportar CSV
        const importBtn = document.getElementById('import-csv');
        const exportBtn = document.getElementById('export-csv');
        
        if (importBtn) importBtn.addEventListener('click', () => this.importCSV());
        if (exportBtn) exportBtn.addEventListener('click', () => this.csvManager.exportToCSV());
    }

    // Configurar tabs
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    // Configurar selector de ubicación
    setupLocationSelector() {
        const locationSelect = document.getElementById('impact-region');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                this.handleLocationChange(e.target.value);
            });
        }
    }

    // Cambiar entre tabs
    switchTab(tabName) {
        // Ocultar todos los tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remover active de todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar tab seleccionado
        const targetTab = document.getElementById(`${tabName}-tab`);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
        
        // Acciones específicas por tab
        if (tabName === 'real-time') {
            this.loadRealTimeData();
        } else if (tabName === 'historical') {
            this.loadHistoricalData();
        }
    }

    // Ejecutar simulación principal
    async runSimulation() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        
        try {
            // Obtener parámetros actuales
            const parameters = this.getCurrentParameters();
            const location = this.getCurrentLocation();
            
            // Calcular efectos del impacto
            const results = this.calculateImpactEffects(parameters);
            
            // Obtener información de ubicación
            const locationInfo = await this.apiManager.getLocationName(location.lat, location.lon);
            
            // Crear escenario actual
            this.currentScenario = {
                parameters,
                results,
                location: {
                    ...location,
                    name: locationInfo
                },
                timestamp: new Date().toISOString()
            };
            
            // Mostrar resultados
            this.displayResults(this.currentScenario);
            
            console.log('✅ Simulación completada:', this.currentScenario);
            
        } catch (error) {
            console.error('Error en simulación:', error);
            this.showError('Error ejecutando simulación');
        } finally {
            this.isSimulating = false;
        }
    }

    // Obtener parámetros actuales de los controles
    getCurrentParameters() {
        return {
            diameter: parseFloat(document.getElementById('diameter-slider').value),
            velocity: parseFloat(document.getElementById('velocity-slider').value),
            angle: parseFloat(document.getElementById('angle-slider').value),
            composition: document.querySelector('input[name="composition"]:checked').value
        };
    }

    // Obtener ubicación actual
    getCurrentLocation() {
        const region = document.getElementById('impact-region').value;
        
        // Coordenadas por defecto para diferentes regiones
        const locations = {
            ocean: { lat: 0, lon: -160, name: "Océano Pacífico" },
            urban: { lat: 40.7128, lon: -74.0060, name: "Nueva York" },
            desert: { lat: 36.7783, lon: -119.4179, name: "Desierto" },
            mountain: { lat: 46.8182, lon: -121.6683, name: "Montañas" },
            custom: { lat: 0, lon: 0, name: "Personalizado" }
        };
        
        return locations[region] || locations.ocean;
    }

    // Calcular efectos del impacto (usando funciones existentes)
    calculateImpactEffects(parameters) {
        // Usar las funciones de impactCalculator.js que ya existen
        const mass = calculateMass(parameters.diameter, 
            parameters.composition === 'metallic' ? 7800 : 3000);
        
        const energyJ = calculateKineticEnergy(mass, parameters.velocity * 1000);
        const energyMT = calculateTNTEquivalent(energyJ);
        const craterDiam = calculateCraterDiameter(energyJ, parameters.velocity * 1000, parameters.angle);
        const seismicMag = estimateSeismicMagnitude(energyJ);
        const destructionRad = estimateDestructionRadius(energyMT);
        
        return {
            energy: energyMT,
            crater: craterDiam,
            seismic: seismicMag,
            destruction: destructionRad,
            mass: mass,
            comparison: compareToKnownEvents(energyMT)
        };
    }

    // Mostrar resultados en la UI
    displayResults(scenario) {
        const { results, location } = scenario;
        
        // Actualizar tarjetas de resultados
        this.updateResultCard('energy', formatEnergy(results.energy));
        this.updateResultCard('crater', formatDistance(results.crater));
        this.updateResultCard('seismic', results.seismic.toFixed(2));
        this.updateResultCard('destruction', formatDistance(results.destruction * 1000));
        
        // Actualizar comparación
        const comparisonElem = document.getElementById('result-comparison');
        if (comparisonElem) {
            comparisonElem.textContent = results.comparison;
        }
        
        // Mostrar efectos específicos
        this.displaySpecificEffects(scenario);
        
        // Actualizar información de ubicación
        this.updateLocationInfo(location);
    }

    // Actualizar tarjeta de resultado individual
    updateResultCard(type, value) {
        const element = document.getElementById(`result-${type}`);
        if (element) {
            element.textContent = value;
        }
    }

    // Mostrar efectos específicos según el tipo de impacto
    displaySpecificEffects(scenario) {
        const { parameters, results, location } = scenario;
        
        // Efecto de tsunami para impactos oceánicos
        const tsunamiElem = document.getElementById('tsunami-effect');
        if (tsunamiElem) {
            if (location.name.includes('Océano') || parameters.composition === 'icy') {
                const waveHeight = estimateTsunamiWaveHeight(results.energy, 4000);
                tsunamiElem.querySelector('#tsunami-height').textContent = waveHeight.toFixed(1);
                tsunamiElem.classList.remove('hidden');
            } else {
                tsunamiElem.classList.add('hidden');
            }
        }
        
        // Bola de fuego
        const fireballElem = document.getElementById('fireball-effect');
        if (fireballElem) {
            const fireballRadius = results.destruction * 0.3;
            fireballElem.querySelector('#fireball-radius').textContent = fireballRadius.toFixed(1);
        }
    }

    // Actualizar información de ubicación
    updateLocationInfo(location) {
        const locationElem = document.getElementById('real-location');
        if (locationElem) {
            locationElem.textContent = location.name;
        }
    }

    // Cargar datos de NASA
    async loadNASAData() {
        try {
            const nasaData = await this.apiManager.getNASAAsteroids();
            this.displayNASAData(nasaData);
        } catch (error) {
            this.showError('Error cargando datos de NASA');
        }
    }

    // Mostrar datos de NASA
    displayNASAData(data) {
        const container = document.getElementById('nasa-asteroids-list');
        if (!container) return;
        
        const asteroids = Object.values(data.near_earth_objects).flat();
        
        container.innerHTML = asteroids.slice(0, 5).map(asteroid => `
            <div class="nasa-asteroid-item">
                <strong>${asteroid.name}</strong>
                <div>Diámetro: ${(asteroid.estimated_diameter.meters.estimated_diameter_min / 1000).toFixed(1)} km</div>
                <div>Velocidad: ${parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1)} km/s</div>
                <div class="${asteroid.is_potentially_hazardous_asteroid ? 'hazardous' : 'safe'}">
                    ${asteroid.is_potentially_hazardous_asteroid ? '⚠️ Peligroso' : '✅ Seguro'}
                </div>
            </div>
        `).join('');
    }

    // Cargar escenarios guardados
    loadSavedScenarios() {
        const scenarios = this.csvManager.getScenarios();
        this.displaySavedScenarios(scenarios);
    }

    // Mostrar escenarios guardados
    displaySavedScenarios(scenarios) {
        const container = document.getElementById('scenarios-list');
        if (!container) return;
        
        container.innerHTML = scenarios.map(scenario => `
            <div class="scenario-card" data-id="${scenario.id}">
                <h5>${scenario.name}</h5>
                <div class="scenario-stats">
                    <span>⚡ ${formatEnergy(scenario.results.energy)}</span>
                    <span>📍 ${scenario.location.name}</span>
                </div>
                <div class="scenario-actions">
                    <button class="btn-small load-btn" onclick="simulator.loadScenario('${scenario.id}')">
                        🔄 Cargar
                    </button>
                    <button class="btn-small delete-btn" onclick="simulator.deleteScenario('${scenario.id}')">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Guardar escenario actual
    saveCurrentScenario() {
        if (!this.currentScenario) {
            this.showError('No hay simulación para guardar');
            return;
        }
        
        const name = prompt('Nombre del escenario:', `Impacto ${new Date().toLocaleTimeString()}`);
        if (!name) return;
        
        const savedScenario = this.csvManager.saveScenario({
            name,
            ...this.currentScenario
        });
        
        this.loadSavedScenarios();
        this.showSuccess('Escenario guardado correctamente');
    }

    // Cargar escenario específico
    loadScenario(scenarioId) {
        const scenarios = this.csvManager.getScenarios();
        const scenario = scenarios.find(s => s.id === scenarioId);
        
        if (scenario) {
            this.currentScenario = scenario;
            this.displayResults(scenario);
            this.showSuccess('Escenario cargado');
        }
    }

    // Eliminar escenario
    deleteScenario(scenarioId) {
        if (confirm('¿Estás seguro de eliminar este escenario?')) {
            this.csvManager.deleteScenario(scenarioId);
            this.loadSavedScenarios();
        }
    }

    // Importar CSV
    async importCSV() {
        const fileInput = document.getElementById('csv-file');
        if (!fileInput) return;
        
        fileInput.click();
        
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                await this.csvManager.importFromCSV(file);
                this.loadSavedScenarios();
                this.showSuccess('CSV importado correctamente');
            } catch (error) {
                this.showError('Error importando CSV');
            }
        };
    }

    // Reiniciar simulación
    resetSimulation() {
        // Resetear sliders a valores por defecto
        document.getElementById('diameter-slider').value = 100;
        document.getElementById('diameter-value').textContent = '100';
        
        document.getElementById('velocity-slider').value = 15;
        document.getElementById('velocity-value').textContent = '15';
        
        document.getElementById('angle-slider').value = 45;
        document.getElementById('angle-value').textContent = '45';
        
        // Resetear resultados
        this.currentScenario = null;
        this.clearResults();
        
        this.showSuccess('Simulación reiniciada');
    }

    // Limpiar resultados
    clearResults() {
        const resultIds = ['energy', 'crater', 'seismic', 'destruction'];
        resultIds.forEach(id => {
            this.updateResultCard(id, '-');
        });
        
        const comparisonElem = document.getElementById('result-comparison');
        if (comparisonElem) comparisonElem.textContent = '-';
    }

    // Actualizar vista previa en tiempo real
    updatePreview() {
        // Esta función se llama cuando los sliders cambian
        // Podemos mostrar una vista previa básica aquí
        console.log('Actualizando vista previa...');
    }

    // Manejar cambio de ubicación
    handleLocationChange(region) {
        console.log('Ubicación cambiada a:', region);
        // Aquí podríamos actualizar el mapa o coordenadas
    }

    // Cargar datos en tiempo real
    async loadRealTimeData() {
        // Implementar carga de datos en tiempo real
        console.log('Cargando datos en tiempo real...');
    }

    // Cargar datos históricos
    async loadHistoricalData() {
        // Implementar carga de datos históricos
        console.log('Cargando datos históricos...');
    }

    // Mostrar mensaje de error
    showError(message) {
        alert(`❌ Error: ${message}`);
    }

    // Mostrar mensaje de éxito
    showSuccess(message) {
        // Podríamos implementar un sistema de notificaciones más elegante
        console.log(`✅ ${message}`);
    }
}

// Instancia global del simulador
let simulator;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    simulator = new MeteorSimulator();
    console.log('🚀 Simulador de Meteoros inicializado');
});
