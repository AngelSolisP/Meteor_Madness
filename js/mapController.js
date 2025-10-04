/**
 * Map Controller Module
 * Maneja la inicialización y control del mapa Leaflet
 */

// Variables globales del mapa
let map = null;
let markersLayer = null;
let currentMarkers = [];
let selectedMarker = null;

/**
 * Inicializa el mapa Leaflet
 */
function initializeMap() {
    try {
        console.log('Inicializando mapa...');

        // Crear mapa centrado en latitud 0, longitud 0
        map = L.map('map', {
            center: [0, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 18,
            zoomControl: true
        });

        // Agregar capa de tiles (OpenStreetMap estilo oscuro)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Crear capa para marcadores
        markersLayer = L.layerGroup().addTo(map);

        console.log('✓ Mapa inicializado correctamente');

    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        throw error;
    }
}

/**
 * Agrega marcadores de asteroides al mapa
 * @param {Array} asteroids - Array de objetos de asteroides
 */
function addAsteroidMarkers(asteroids) {
    try {
        console.log(`Agregando ${asteroids.length} marcadores al mapa...`);

        // Limpiar marcadores existentes
        clearMarkers();

        // Array para almacenar coordenadas para fitBounds
        const bounds = [];

        asteroids.forEach(asteroid => {
            // Validar que tenga coordenadas
            if (!asteroid.impact_scenario ||
                typeof asteroid.impact_scenario.latitude !== 'number' ||
                typeof asteroid.impact_scenario.longitude !== 'number') {
                console.warn(`Asteroide ${asteroid.id} no tiene coordenadas válidas`);
                return;
            }

            const lat = asteroid.impact_scenario.latitude;
            const lon = asteroid.impact_scenario.longitude;

            // Determinar color del marcador según peligrosidad
            const isHazardous = asteroid.is_hazardous;
            const markerColor = isHazardous ? '#e63946' : '#ffd23f';
            const markerIcon = isHazardous ? '🔴' : '🟡';

            // Crear icono personalizado
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background-color: ${markerColor};
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 10px ${markerColor};
                    cursor: pointer;
                "></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            // Crear marcador
            const marker = L.marker([lat, lon], {
                icon: customIcon,
                title: asteroid.name
            });

            // Preparar contenido del popup
            const energyMT = asteroid.impact_calculations?.tnt_megatons?.toFixed(2) || 'N/A';
            const popupContent = `
                <div style="color: white; min-width: 200px;">
                    <strong style="color: #ff6b35; font-size: 1.1em;">${asteroid.name}</strong><br>
                    <span style="color: #b8c5d6;">Energía: ${energyMT} MT TNT</span><br>
                    <span style="color: ${isHazardous ? '#e63946' : '#4ecca3'}; font-weight: bold;">
                        ${isHazardous ? '⚠️ Peligroso' : '✓ No Peligroso'}
                    </span>
                </div>
            `;

            marker.bindPopup(popupContent);

            // Evento click para mostrar panel de información
            marker.on('click', (e) => {
                // Detener propagación para evitar que el simulador capture el evento
                L.DomEvent.stopPropagation(e);

                // Si el simulador está activo, desactivarlo primero
                if (typeof SimulatorState !== 'undefined' && SimulatorState.isActive) {
                    if (typeof deactivateSimulatorMode === 'function') {
                        deactivateSimulatorMode();
                    }
                }

                // Si el panel del simulador está abierto, cerrarlo
                if (typeof closeSimulatorPanel === 'function') {
                    closeSimulatorPanel();
                }

                highlightMarker(asteroid.id);
                // Llamar a función del UI controller (se define en uiController.js)
                if (typeof showAsteroidPanel === 'function') {
                    showAsteroidPanel(asteroid);
                }
            });

            // Guardar referencia al asteroide en el marcador
            marker.asteroidId = asteroid.id;

            // Agregar marcador a la capa
            marker.addTo(markersLayer);

            // Guardar marcador en array
            currentMarkers.push(marker);

            // Agregar coordenadas a bounds
            bounds.push([lat, lon]);
        });

        // Ajustar vista del mapa para mostrar todos los marcadores
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        console.log(`✓ ${currentMarkers.length} marcadores agregados correctamente`);

    } catch (error) {
        console.error('Error al agregar marcadores:', error);
        throw error;
    }
}

/**
 * Resalta un marcador específico
 * @param {string} asteroidId - ID del asteroide a resaltar
 */
function highlightMarker(asteroidId) {
    // Quitar resaltado anterior
    if (selectedMarker) {
        // Restaurar tamaño normal
        const oldIcon = selectedMarker.getIcon();
        oldIcon.options.html = oldIcon.options.html.replace('width: 30px; height: 30px', 'width: 20px; height: 20px');
        selectedMarker.setIcon(oldIcon);
    }

    // Buscar y resaltar nuevo marcador
    const marker = currentMarkers.find(m => m.asteroidId === asteroidId);

    if (marker) {
        // Aumentar tamaño del marcador
        const icon = marker.getIcon();
        icon.options.html = icon.options.html.replace('width: 20px; height: 20px', 'width: 30px; height: 30px');
        marker.setIcon(icon);

        // Centrar mapa en el marcador
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 4), {
            animate: true
        });

        selectedMarker = marker;
    }
}

/**
 * Limpia todos los marcadores del mapa
 */
function clearMarkers() {
    if (markersLayer) {
        markersLayer.clearLayers();
    }
    currentMarkers = [];
    selectedMarker = null;
    console.log('Marcadores limpiados');
}

/**
 * Actualiza la visibilidad de los marcadores según filtro
 * @param {boolean} showOnlyHazardous - Si es true, muestra solo peligrosos
 */
function updateMarkerVisibility(showOnlyHazardous) {
    let visibleCount = 0;

    currentMarkers.forEach(marker => {
        const asteroidId = marker.asteroidId;
        const asteroid = getAsteroidById(asteroidId);

        if (!asteroid) {
            marker.remove();
            return;
        }

        if (showOnlyHazardous) {
            // Mostrar solo peligrosos
            if (asteroid.is_hazardous) {
                if (!map.hasLayer(marker)) {
                    marker.addTo(markersLayer);
                }
                visibleCount++;
            } else {
                marker.remove();
            }
        } else {
            // Mostrar todos
            if (!map.hasLayer(marker)) {
                marker.addTo(markersLayer);
            }
            visibleCount++;
        }
    });

    console.log(`Marcadores visibles: ${visibleCount}`);
    return visibleCount;
}

/**
 * Obtiene el objeto del mapa
 * @returns {Object} Objeto del mapa Leaflet
 */
function getMap() {
    return map;
}

/**
 * Obtiene todos los marcadores actuales
 * @returns {Array} Array de marcadores
 */
function getMarkers() {
    return currentMarkers;
}

/**
 * Centra el mapa en una ubicación específica
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @param {number} zoom - Nivel de zoom (opcional)
 */
function centerMap(lat, lon, zoom = 5) {
    if (map) {
        map.setView([lat, lon], zoom, { animate: true });
    }
}
