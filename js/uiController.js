/**
 * UI Controller Module
 * Maneja la interfaz de usuario y eventos
 */

// Referencias a elementos del DOM
let infoPanelElement = null;
let closePanelBtn = null;
let toggleHazardousCheckbox = null;
let asteroidCountElement = null;
let loadingElement = null;

/**
 * Inicializa los controladores de UI
 */
function initializeUIController() {
    console.log('Inicializando controladores de UI...');

    // Obtener referencias a elementos
    infoPanelElement = document.getElementById('info-panel');
    closePanelBtn = document.getElementById('close-panel');
    toggleHazardousCheckbox = document.getElementById('toggle-hazardous');
    asteroidCountElement = document.getElementById('asteroid-count');
    loadingElement = document.getElementById('loading');

    // Event listeners
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', hideAsteroidPanel);
    }

    if (toggleHazardousCheckbox) {
        toggleHazardousCheckbox.addEventListener('change', handleHazardousToggle);
    }

    // Botón de simulador
    const simulatorBtn = document.getElementById('btn-simulator');

    if (simulatorBtn) {
        simulatorBtn.addEventListener('click', () => {
            // Toggle simulator mode
            if (typeof activateSimulatorMode === 'function' && typeof deactivateSimulatorMode === 'function') {
                if (SimulatorState && SimulatorState.isActive) {
                    deactivateSimulatorMode();
                } else {
                    activateSimulatorMode();
                }
            }
        });
    }

    console.log('✓ Controladores de UI inicializados');
}

/**
 * Muestra el panel de información de un asteroide
 * @param {Object} asteroidData - Datos del asteroide
 */
function showAsteroidPanel(asteroidData) {
    if (!infoPanelElement) return;

    console.log(`Mostrando panel para asteroide: ${asteroidData.name}`);

    // Poblar datos básicos
    document.getElementById('panel-name').textContent = asteroidData.name || 'N/A';

    // Parámetros físicos
    const diameter_avg = asteroidData.physical_params?.diameter_avg_m;
    if (diameter_avg) {
        document.getElementById('panel-diameter').textContent = `${diameter_avg.toFixed(2)} m`;
    } else {
        document.getElementById('panel-diameter').textContent = 'N/A';
    }

    const velocity = asteroidData.physical_params?.velocity_kms;
    if (velocity) {
        document.getElementById('panel-velocity').textContent = `${velocity.toFixed(2)} km/s`;
    } else {
        document.getElementById('panel-velocity').textContent = 'N/A';
    }

    const mass = asteroidData.physical_params?.mass_kg;
    if (mass) {
        document.getElementById('panel-mass').textContent = formatLargeNumber(mass) + ' kg';
    } else {
        document.getElementById('panel-mass').textContent = 'N/A';
    }

    // Estado de peligrosidad
    const hazardBadge = document.getElementById('panel-hazard');
    if (asteroidData.is_hazardous) {
        hazardBadge.textContent = 'Hazardous';
        hazardBadge.className = 'hazard-badge dangerous';
    } else {
        hazardBadge.textContent = 'Not Hazardous';
        hazardBadge.className = 'hazard-badge safe';
    }

    // Energía de impacto
    const energy_mt = asteroidData.impact_calculations?.tnt_megatons;
    if (energy_mt) {
        document.getElementById('panel-energy').textContent = energy_mt.toLocaleString('en-US', {
            maximumFractionDigits: 2
        });

        // Comparación con Hiroshima
        const comparison = compareToKnownEvents(energy_mt);
        document.getElementById('panel-comparison').textContent = comparison;
    } else {
        document.getElementById('panel-energy').textContent = 'N/A';
        document.getElementById('panel-comparison').textContent = 'Not available';
    }

    // Efectos del impacto
    const impact_lat = asteroidData.impact_scenario?.latitude;
    const impact_lon = asteroidData.impact_scenario?.longitude;
    const region = asteroidData.impact_scenario?.region;

    if (impact_lat !== undefined && impact_lon !== undefined) {
        document.getElementById('panel-location').textContent =
            `${impact_lat.toFixed(2)}°, ${impact_lon.toFixed(2)}° (${region || 'N/A'})`;
    } else {
        document.getElementById('panel-location').textContent = 'N/A';
    }

    // Tipo de superficie
    const surface_type = asteroidData.impact_effects?.surface_type;
    document.getElementById('panel-surface').textContent =
        surface_type === 'ocean' ? 'Ocean' :
        surface_type === 'land' ? 'Land' : 'N/A';

    // Magnitud sísmica
    const seismic_mag = asteroidData.impact_calculations?.seismic_magnitude;
    if (seismic_mag) {
        document.getElementById('panel-seismic').textContent = seismic_mag.toFixed(2);
    } else {
        document.getElementById('panel-seismic').textContent = 'N/A';
    }

    // Diámetro del cráter
    const crater_diameter = asteroidData.impact_calculations?.crater_diameter_m;
    if (crater_diameter) {
        document.getElementById('panel-crater').textContent = `${crater_diameter.toFixed(2)} m`;
    } else {
        document.getElementById('panel-crater').textContent = 'N/A';
    }

    // Información de tsunami (si aplica)
    const tsunamiInfo = document.getElementById('tsunami-info');
    if (surface_type === 'ocean' && asteroidData.impact_effects?.tsunami) {
        const tsunami = asteroidData.impact_effects.tsunami;
        const wave_height = tsunami.estimated_wave_height_m;
        const threat_radius = tsunami.coastal_threat_radius_km;
        const risk = tsunami.risk;

        const tsunamiText = `Estimated wave height: ${wave_height} m | ` +
                          `Coastal threat radius: ${threat_radius} km | ` +
                          `Risk level: ${risk === 'high' ? 'High' : risk === 'moderate' ? 'Moderate' : 'Low'}`;

        document.getElementById('tsunami-details').textContent = tsunamiText;
        tsunamiInfo.style.display = 'block';
    } else {
        tsunamiInfo.style.display = 'none';
    }

    // Datos orbitales
    const approach_date = asteroidData.approach_date;
    if (approach_date) {
        document.getElementById('panel-approach').textContent = approach_date;
    } else {
        document.getElementById('panel-approach').textContent = 'N/A';
    }

    const orbit_class = asteroidData.orbit_class;
    if (orbit_class) {
        document.getElementById('panel-orbit-class').textContent = orbit_class;
    } else {
        document.getElementById('panel-orbit-class').textContent = 'N/A';
    }

    // Renderizar gráficas (si está disponible el controlador)
    if (typeof renderAllCharts === 'function') {
        const allAsteroids = getAllAsteroids();
        renderAllCharts(asteroidData, allAsteroids);
    }

    // Renderizar círculos de destrucción en el mapa
    if (typeof renderAsteroidDestructionCircles === 'function') {
        renderAsteroidDestructionCircles(asteroidData);
    }

    // Mostrar leyenda flotante
    if (typeof showLegend === 'function') {
        showLegend();
    }

    // Mostrar panel con animación
    infoPanelElement.classList.add('active');

    // Scroll al inicio del panel
    infoPanelElement.scrollTop = 0;
}

/**
 * Oculta el panel de información
 */
function hideAsteroidPanel() {
    if (infoPanelElement) {
        infoPanelElement.classList.remove('active');
        console.log('Panel cerrado');

        // Destruir gráficas para liberar memoria
        if (typeof destroyCharts === 'function') {
            destroyCharts();
        }

        // Limpiar círculos de destrucción del mapa
        if (typeof clearAsteroidCircles === 'function') {
            clearAsteroidCircles();
        }

        // Ocultar leyenda flotante
        if (typeof hideLegend === 'function') {
            hideLegend();
        }
    }
}

/**
 * Maneja el toggle del filtro de asteroides peligrosos
 * @param {Event} event - Evento del checkbox
 */
function handleHazardousToggle(event) {
    const showOnlyHazardous = event.target.checked;
    console.log(`Filtro de peligrosos: ${showOnlyHazardous ? 'Activado' : 'Desactivado'}`);

    // Actualizar visibilidad de marcadores
    updateMarkerVisibility(showOnlyHazardous);

    // Actualizar contador
    updateAsteroidCount();
}

/**
 * Actualiza el contador de asteroides visibles
 */
function updateAsteroidCount() {
    if (!asteroidCountElement) return;

    const showOnlyHazardous = toggleHazardousCheckbox?.checked || false;

    let count = 0;
    if (showOnlyHazardous) {
        count = getHazardousAsteroids().length;
    } else {
        count = getAllAsteroids().length;
    }

    asteroidCountElement.textContent = count;
}

/**
 * Muestra el indicador de carga
 */
function showLoading() {
    if (loadingElement) {
        loadingElement.classList.remove('hidden');
    }
}

/**
 * Oculta el indicador de carga
 */
function hideLoading() {
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}

/**
 * Muestra un mensaje de error al usuario
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    console.error('Error:', message);
    alert(`Error: ${message}`);
}

/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje de éxito
 */
function showSuccess(message) {
    console.log('Éxito:', message);
    // En Fase 2 se puede implementar un toast/notification más elegante
}

/**
 * Formatea números grandes para mostrar en UI
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
function formatLargeNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + ' trillion';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + ' billion';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + ' million';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + ' thousand';
    } else {
        return num.toFixed(2);
    }
}
