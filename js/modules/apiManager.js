// js/modules/apiManager.js

class APIManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutos
    }

    // NASA NEO API
    async getNASAAsteroids() {
        const cacheKey = 'nasa_asteroids';
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            console.log('✅ Usando datos de NASA en caché');
            return cached;
        }

        try {
            console.log('🌐 Obteniendo datos de NASA...');
            const response = await fetch('https://api.nasa.gov/neo/rest/v1/feed?api_key=DEMO_KEY');
            
            if (!response.ok) throw new Error(`NASA API error: ${response.status}`);
            
            const data = await response.json();
            this.setCache(cacheKey, data);
            
            console.log('✅ Datos de NASA obtenidos correctamente');
            return data;
        } catch (error) {
            console.warn('⚠️ No se pudieron obtener datos de NASA, usando datos de ejemplo');
            return this.getSampleNASAData();
        }
    }

    // OpenStreetMap Nominatim API
    async getLocationName(lat, lon) {
        const cacheKey = `location_${lat}_${lon}`;
        const cached = this.getFromCache(cacheKey);
        
        if (cached) return cached;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`
            );
            
            if (!response.ok) throw new Error('Location API error');
            
            const data = await response.json();
            const locationName = data.display_name || 'Ubicación desconocida';
            
            this.setCache(cacheKey, locationName);
            return locationName;
        } catch (error) {
            console.warn('Error obteniendo nombre de ubicación:', error);
            return 'Ubicación no disponible';
        }
    }

    // Datos de ejemplo para desarrollo
    getSampleNASAData() {
        return {
            near_earth_objects: {
                [new Date().toISOString().split('T')[0]]: [
                    {
                        id: "2001036",
                        name: "1036 Ganymed (A924 UB)",
                        estimated_diameter: {
                            meters: {
                                estimated_diameter_min: 31000,
                                estimated_diameter_max: 32000
                            }
                        },
                        close_approach_data: [{
                            relative_velocity: {
                                kilometers_per_second: "15.23"
                            },
                            miss_distance: {
                                kilometers: "38400000"
                            }
                        }],
                        is_potentially_hazardous_asteroid: true
                    }
                ]
            }
        };
    }

    // Sistema de caché
    getFromCache(key) {
        const item = this.cache.get(key);
        if (item && Date.now() - item.timestamp < this.cacheTimeout) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}
