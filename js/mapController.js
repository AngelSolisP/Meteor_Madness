/**
 * Map Controller Module
 * Maneja la inicialización y control del mapa Leaflet
 */

// Variables globales del mapa
let map = null;
let markersLayer = null;
let currentMarkers = [];
let selectedMarker = null;
let asteroidCirclesLayer = null;

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

        // Agregar capa de tiles (CartoDB dark matter with visible labels)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
            className: 'map-tiles-brightened'
        }).addTo(map);

        // Crear capa para marcadores
        markersLayer = L.layerGroup().addTo(map);

        // Crear capa para círculos de destrucción de asteroides (featureGroup tiene getBounds)
        asteroidCirclesLayer = L.featureGroup();

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

            // Determinar estilo del marcador según peligrosidad
            const isHazardous = asteroid.is_hazardous;

            // Crear icono personalizado con nuevo diseño
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="marker-wrapper ${isHazardous ? 'marker--hazardous' : ''}">
                        <div class="marker-outer-ring"></div>
                        <div class="marker-inner-dot"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
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
                    <span style="color: #b8c5d6;">Energy: ${energyMT} MT TNT</span><br>
                    <span style="color: ${isHazardous ? '#e63946' : '#4ecca3'}; font-weight: bold;">
                        ${isHazardous ? '⚠️ Hazardous' : '✓ Not Hazardous'}
                    </span>
                </div>
            `;

            marker.bindPopup(popupContent);

            // Evento click para mostrar panel de información
            marker.on('click', (e) => {
                console.log(`🎯 Click en asteroide: ${asteroid.name}`);

                // Detener propagación para evitar que el simulador capture el evento
                L.DomEvent.stopPropagation(e);

                // Si el panel del simulador está abierto O el modo está activo, cerrarlo todo
                if (typeof SimulatorState !== 'undefined' &&
                    (SimulatorState.isActive || SimulatorState.isPanelOpen)) {
                    console.log('Cerrando panel de simulador antes de mostrar asteroide');
                    if (typeof closeSimulatorPanel === 'function') {
                        closeSimulatorPanel();
                    }
                }

                highlightMarker(asteroid.id);
                // Llamar a función del UI controller (se define en uiController.js)
                console.log('Intentando mostrar panel de asteroide...');
                if (typeof showAsteroidPanel === 'function') {
                    showAsteroidPanel(asteroid);
                } else {
                    console.error('❌ showAsteroidPanel no está definida!');
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

/**
 * Renderiza los círculos de destrucción para un asteroide del dataset
 * @param {Object} asteroidData - Datos del asteroide
 */
function renderAsteroidDestructionCircles(asteroidData) {
    if (!asteroidCirclesLayer || !asteroidData) return;

    console.log(`Renderizando círculos de destrucción para: ${asteroidData.name}`);

    // Limpiar círculos anteriores
    asteroidCirclesLayer.clearLayers();

    // Obtener ubicación de impacto
    const lat = asteroidData.impact_scenario?.latitude;
    const lng = asteroidData.impact_scenario?.longitude;

    if (!lat || !lng) {
        console.warn('No hay ubicación de impacto para este asteroide');
        return;
    }

    // Obtener energía del impacto
    const energy_mt = asteroidData.impact_calculations?.tnt_megatons || 0;

    if (energy_mt === 0) {
        console.warn('No hay energía de impacto calculada');
        return;
    }

    // Calcular radios de destrucción (usando las mismas fórmulas del simulador)
    const total_radius_km = Math.pow(energy_mt, 0.33) * 2;
    const severe_radius_km = total_radius_km * 2.1;
    const moderate_radius_km = severe_radius_km * 1.9;

    console.log(`Radios calculados: Total=${total_radius_km.toFixed(1)}km, Severe=${severe_radius_km.toFixed(1)}km, Moderate=${moderate_radius_km.toFixed(1)}km`);

    // Círculo 3 - Daño Moderado (más grande, se dibuja primero)
    const moderateCircle = L.circle([lat, lng], {
        radius: moderate_radius_km * 1000, // km a metros
        color: '#ffd700',
        fillColor: '#ffd700',
        fillOpacity: 0.1,
        weight: 2
    }).addTo(asteroidCirclesLayer)
      .bindTooltip(`Moderate damage: ${moderate_radius_km.toFixed(1)} km`, { permanent: false });
    moderateCircle.getElement()?.setAttribute('role', 'img');
    moderateCircle.getElement()?.setAttribute('aria-label', `Moderate damage zone: ${moderate_radius_km.toFixed(1)} kilometer radius`);

    // Círculo 2 - Daño Severo
    const severeCircle = L.circle([lat, lng], {
        radius: severe_radius_km * 1000,
        color: '#ff6b35',
        fillColor: '#ff6b35',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(asteroidCirclesLayer)
      .bindTooltip(`Severe damage: ${severe_radius_km.toFixed(1)} km`, { permanent: false });
    severeCircle.getElement()?.setAttribute('role', 'img');
    severeCircle.getElement()?.setAttribute('aria-label', `Severe damage zone: ${severe_radius_km.toFixed(1)} kilometer radius`);

    // Círculo 1 - Destrucción Total (más pequeño, se dibuja último)
    const totalCircle = L.circle([lat, lng], {
        radius: total_radius_km * 1000,
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(asteroidCirclesLayer)
      .bindTooltip(`Total destruction: ${total_radius_km.toFixed(1)} km`, { permanent: false });
    totalCircle.getElement()?.setAttribute('role', 'img');
    totalCircle.getElement()?.setAttribute('aria-label', `Total destruction zone: ${total_radius_km.toFixed(1)} kilometer radius`);

    // Agregar capa al mapa
    asteroidCirclesLayer.addTo(map);

    // Ajustar vista para mostrar todos los círculos
    const bounds = asteroidCirclesLayer.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Show legend
    const legend = document.getElementById('map-legend');
    if (legend) {
        legend.classList.remove('hidden');
    }

    console.log('✓ Círculos de destrucción renderizados');
}

/**
 * Limpia los círculos de destrucción del mapa
 */
function clearAsteroidCircles() {
    if (!asteroidCirclesLayer) return;

    console.log('Limpiando círculos de destrucción de asteroides');

    asteroidCirclesLayer.clearLayers();

    if (map && map.hasLayer(asteroidCirclesLayer)) {
        map.removeLayer(asteroidCirclesLayer);
    }

    // Hide legend
    const legend = document.getElementById('map-legend');
    if (legend) {
        legend.classList.add('hidden');
    }
}
