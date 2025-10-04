/**
 * Data Loader Module
 * Maneja la carga y acceso a los datos de asteroides
 */

// Cache de datos en memoria
let asteroidCache = [];
let isDataLoaded = false;

/**
 * Carga los datos de asteroides desde el archivo JSON
 * @returns {Promise<Array>} Array de asteroides
 */
async function loadAsteroidData() {
    try {
        console.log('Iniciando carga de datos de asteroides...');

        const response = await fetch('data/integrated_dataset_final.json');

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Validar que sea un array
        if (!Array.isArray(data)) {
            throw new Error('El formato de datos no es válido (se esperaba un array)');
        }

        // Almacenar en cache
        asteroidCache = data;
        isDataLoaded = true;

        console.log(`✓ Datos cargados exitosamente: ${data.length} asteroides`);

        return data;

    } catch (error) {
        console.error('Error al cargar datos de asteroides:', error);
        alert('Error al cargar los datos de asteroides. Por favor, recarga la página.');
        throw error;
    }
}

/**
 * Obtiene un asteroide por su ID
 * @param {string} id - ID del asteroide
 * @returns {Object|null} Objeto del asteroide o null si no se encuentra
 */
function getAsteroidById(id) {
    if (!isDataLoaded) {
        console.warn('Los datos aún no han sido cargados');
        return null;
    }

    const asteroid = asteroidCache.find(a => a.id === id);

    if (!asteroid) {
        console.warn(`Asteroide con ID ${id} no encontrado`);
    }

    return asteroid || null;
}

/**
 * Obtiene todos los asteroides cargados
 * @returns {Array} Array de todos los asteroides
 */
function getAllAsteroids() {
    if (!isDataLoaded) {
        console.warn('Los datos aún no han sido cargados');
        return [];
    }

    return asteroidCache;
}

/**
 * Obtiene solo los asteroides clasificados como peligrosos
 * @returns {Array} Array de asteroides peligrosos
 */
function getHazardousAsteroids() {
    if (!isDataLoaded) {
        console.warn('Los datos aún no han sido cargados');
        return [];
    }

    return asteroidCache.filter(a => a.is_hazardous === true);
}

/**
 * Obtiene solo los asteroides NO peligrosos
 * @returns {Array} Array de asteroides no peligrosos
 */
function getNonHazardousAsteroids() {
    if (!isDataLoaded) {
        console.warn('Los datos aún no han sido cargados');
        return [];
    }

    return asteroidCache.filter(a => a.is_hazardous === false);
}

/**
 * Obtiene estadísticas de los datos cargados
 * @returns {Object} Objeto con estadísticas
 */
function getDataStats() {
    if (!isDataLoaded) {
        return {
            total: 0,
            hazardous: 0,
            nonHazardous: 0,
            loaded: false
        };
    }

    return {
        total: asteroidCache.length,
        hazardous: asteroidCache.filter(a => a.is_hazardous).length,
        nonHazardous: asteroidCache.filter(a => !a.is_hazardous).length,
        loaded: true
    };
}

/**
 * Verifica si los datos están cargados
 * @returns {boolean} True si los datos están cargados
 */
function isLoaded() {
    return isDataLoaded;
}

/**
 * Reinicia el cache de datos
 */
function clearCache() {
    asteroidCache = [];
    isDataLoaded = false;
    console.log('Cache de datos limpiado');
}
