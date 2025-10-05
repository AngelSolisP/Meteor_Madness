/**
 * Main Application Module
 * Orquesta la inicialización y funcionamiento de la aplicación
 */

// Estado global de la aplicación
const AppState = {
    isInitialized: false,
    asteroidData: [],
    currentFilter: 'all', // 'all' o 'hazardous'
    selectedAsteroidId: null
};

/**
 * Función principal de inicialización
 */
async function initializeApp() {
    try {
        console.log('=== METEOR MADNESS - INICIANDO APLICACIÓN ===');

        // Mostrar indicador de carga
        showLoading();

        // 1. Inicializar mapa
        console.log('Paso 1/7: Inicializando mapa...');
        initializeMap();

        // 2. Inicializar controladores de UI
        console.log('Paso 2/7: Inicializando UI...');
        initializeUIController();

        // 3. Inicializar catálogo
        console.log('Paso 3/7: Inicializando catálogo...');
        initCatalog();

        // 4. Inicializar gráficas
        console.log('Paso 4/7: Inicializando sistema de gráficas...');
        initCharts();

        // 5. Inicializar tooltips
        console.log('Paso 5/7: Inicializando tooltips educativos...');
        initTooltips();

        // 5.5 Inicializar simulador
        console.log('Paso 5.5/7: Inicializando simulador...');
        initSimulator();

        // 5.6 Inicializar sistema de alertas
        console.log('Paso 5.6/7: Inicializando sistema de alertas...');
        initAlertSystem();

        // 6. Cargar datos de asteroides
        console.log('Paso 6/7: Cargando datos de asteroides...');
        const asteroids = await loadAsteroidData();
        AppState.asteroidData = asteroids;

        // 7. Agregar marcadores al mapa
        console.log('Paso 7/7: Agregando marcadores al mapa...');
        addAsteroidMarkers(asteroids);

        // Actualizar contador
        updateAsteroidCount();

        // Ocultar indicador de carga
        hideLoading();

        // Marcar como inicializado
        AppState.isInitialized = true;

        console.log('✓ APLICACIÓN INICIALIZADA CORRECTAMENTE');
        console.log(`✓ Total de asteroides cargados: ${asteroids.length}`);

        // Mostrar estadísticas
        displayStats();

    } catch (error) {
        console.error('Fatal error initializing application:', error);
        hideLoading();
        showError('Could not initialize the application. Please reload the page.');
    }
}

/**
 * Muestra estadísticas de los datos en la consola
 */
function displayStats() {
    const stats = getDataStats();

    console.log('\n=== ESTADÍSTICAS DE DATOS ===');
    console.log(`Total de asteroides: ${stats.total}`);
    console.log(`Asteroides peligrosos: ${stats.hazardous}`);
    console.log(`Asteroides no peligrosos: ${stats.nonHazardous}`);

    // Calcular energía total
    let totalEnergy = 0;
    let maxEnergy = 0;
    let maxEnergyAsteroid = null;

    AppState.asteroidData.forEach(asteroid => {
        const energy = asteroid.impact_calculations?.tnt_megatons || 0;
        totalEnergy += energy;

        if (energy > maxEnergy) {
            maxEnergy = energy;
            maxEnergyAsteroid = asteroid.name;
        }
    });

    console.log(`Energía total combinada: ${totalEnergy.toFixed(2)} megatones TNT`);
    console.log(`Asteroide más energético: ${maxEnergyAsteroid} (${maxEnergy.toFixed(2)} MT)`);
    console.log('===========================\n');
}

/**
 * Maneja errores globales no capturados
 */
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
});

/**
 * Maneja promesas rechazadas no capturadas
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no capturada:', event.reason);
});

/**
 * Event listener para cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado. Iniciando aplicación...');
    initializeApp();
});

/**
 * Event listener para redimensionamiento de ventana
 */
window.addEventListener('resize', () => {
    // Invalidar tamaño del mapa para que se ajuste
    if (AppState.isInitialized) {
        const map = getMap();
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }
});

/**
 * Función de utilidad para debugging
 * Se puede llamar desde la consola del navegador
 */
window.debugMeteorMadness = function() {
    console.log('=== DEBUG INFO ===');
    console.log('App Initialized:', AppState.isInitialized);
    console.log('Total Asteroids:', AppState.asteroidData.length);
    console.log('Current Filter:', AppState.currentFilter);
    console.log('Selected Asteroid:', AppState.selectedAsteroidId);
    console.log('Markers:', getMarkers().length);
    console.log('==================');
    return AppState;
};

/**
 * Información de la aplicación para consola
 */
console.log('%c🌠 AMST v1.2 - Asteroid Monitoring & Simulation Tool 🌠', 'color: #ff6b35; font-size: 20px; font-weight: bold;');
console.log('%cInteractive Asteroid Impact Visualization & Analysis', 'color: #b8c5d6; font-size: 12px;');
console.log('%cNEW: Impact Simulator | IAWN/SMPAG Alert System | Public Awareness', 'color: #4ecca3; font-size: 11px;');
console.log('%cData: NASA NEO API + USGS | Built with Leaflet.js and Chart.js', 'color: #7a8ba3; font-size: 10px;');
console.log('%cFor debugging, use: window.debugMeteorMadness()', 'color: #ffd23f; font-size: 10px;');
console.log('\n');
