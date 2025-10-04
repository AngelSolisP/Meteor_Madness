/**
 * Map Controller Module
 * Maneja la inicialización y control del mapa Leaflet
 */

// Variables globales del mapa
let map = null;
let markersLayer = null;
let impactOverlaysLayer = null;
let currentMarkers = [];
let selectedMarker = null;
let currentImpactOverlays = [];

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

        // Crear capa para overlays de impacto
        impactOverlaysLayer = L.layerGroup().addTo(map);

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

        // Limpiar marcadores y overlays existentes
        clearMarkers();
        clearImpactOverlays();

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

            // Preparar contenido del popup con detalles de impacto
            const energyMT = asteroid.impact_calculations?.tnt_megatons?.toFixed(2) || 'N/A';
            const craterDiameter = asteroid.impact_calculations?.crater_diameter_m?.toFixed(0) || 'N/A';
            const seismicMag = asteroid.impact_calculations?.seismic_magnitude?.toFixed(1) || 'N/A';

            let impactDetails = '';

            if (asteroid.impact_effects) {
                const effects = asteroid.impact_effects;

                if (effects.surface_type === 'ocean' && effects.tsunami) {
                    const tsunami = effects.tsunami;
                    impactDetails += `
                        <strong style="color: #ff6b35;">Impacto Oceánico:</strong><br>
                        <span style="color: #b8c5d6;">• Ola de tsunami: ${tsunami.estimated_wave_height_m?.toFixed(1) || 'N/A'}m</span><br>
                        <span style="color: #b8c5d6;">• Radio de amenaza costera: ${tsunami.coastal_threat_radius_km?.toFixed(0) || 'N/A'}km</span><br>
                    `;
                } else if (effects.surface_type === 'land' && effects.crater) {
                    const crater = effects.crater;
                    impactDetails += `
                        <strong style="color: #ff6b35;">Impacto Terrestre:</strong><br>
                        <span style="color: #b8c5d6;">• Cráter: ${crater.diameter_m?.toFixed(0) || 'N/A'}m diámetro</span><br>
                        <span style="color: #b8c5d6;">• Radio de destrucción: ${crater.destruction_radius_km?.toFixed(1) || 'N/A'}km</span><br>
                    `;
                }

                if (effects.seismic) {
                    impactDetails += `<span style="color: #b8c5d6;">• Área sísmica sentida: ${effects.seismic.felt_radius_km?.toFixed(0) || 'N/A'}km</span><br>`;
                }
            }

            const popupContent = `
                <div style="color: white; min-width: 250px; max-width: 300px;">
                    <strong style="color: #ff6b35; font-size: 1.1em;">${asteroid.name}</strong><br>
                    <span style="color: #b8c5d6;">Energía: ${energyMT} megatones TNT</span><br>
                    <span style="color: #b8c5d6;">Diámetro cráter: ${craterDiameter}m</span><br>
                    <span style="color: #b8c5d6;">Magnitud sísmica: ${seismicMag}</span><br>
                    <span style="color: ${isHazardous ? '#e63946' : '#4ecca3'}; font-weight: bold;">
                        ${isHazardous ? '⚠️ Peligroso' : '✓ No Peligroso'}
                    </span><br><br>
                    ${impactDetails}
                </div>
            `;

            marker.bindPopup(popupContent);

            // Evento click para mostrar panel de información
            marker.on('click', () => {
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

        // Crear overlays de impacto
        createImpactOverlays(asteroids);

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
 * Limpia todos los overlays de impacto
 */
function clearImpactOverlays() {
    if (impactOverlaysLayer) {
        impactOverlaysLayer.clearLayers();
    }
    currentImpactOverlays = [];
    console.log('Overlays de impacto limpiados');
}

/**
 * Crea overlays visuales para los efectos de impacto
 * @param {Array} asteroids - Array de objetos de asteroides
 */
function createImpactOverlays(asteroids) {
    try {
        console.log(`Creando overlays de impacto para ${asteroids.length} asteroides...`);

        // Limpiar overlays existentes
        clearImpactOverlays();

        asteroids.forEach(asteroid => {
            if (!asteroid.impact_scenario ||
                typeof asteroid.impact_scenario.latitude !== 'number' ||
                typeof asteroid.impact_scenario.longitude !== 'number') {
                return;
            }

            const lat = asteroid.impact_scenario.latitude;
            const lon = asteroid.impact_scenario.longitude;
            const center = [lat, lon];

            if (asteroid.impact_effects) {
                const effects = asteroid.impact_effects;

                // Crear círculos según el tipo de impacto
                if (effects.surface_type === 'ocean' && effects.tsunami) {
                    // Impacto oceánico - mostrar radio de tsunami
                    const tsunamiRadius = effects.tsunami.coastal_threat_radius_km * 1000; // convertir a metros
                    if (tsunamiRadius > 0) {
                        const tsunamiCircle = L.circle(center, {
                            color: '#00ffff',
                            fillColor: '#00ffff',
                            fillOpacity: 0.1,
                            weight: 2,
                            radius: tsunamiRadius
                        }).addTo(impactOverlaysLayer);

                        tsunamiCircle.bindTooltip(`Tsunami: ${effects.tsunami.coastal_threat_radius_km}km radio`, {
                            permanent: false,
                            direction: 'top'
                        });

                        currentImpactOverlays.push(tsunamiCircle);
                    }
                } else if (effects.surface_type === 'land') {
                    // Impacto terrestre - mostrar radio de destrucción del cráter
                    if (effects.crater && effects.crater.destruction_radius_km) {
                        const destructionRadius = effects.crater.destruction_radius_km * 1000; // convertir a metros
                        if (destructionRadius > 0) {
                            const destructionCircle = L.circle(center, {
                                color: '#ff4500',
                                fillColor: '#ff4500',
                                fillOpacity: 0.2,
                                weight: 2,
                                radius: destructionRadius
                            }).addTo(impactOverlaysLayer);

                            destructionCircle.bindTooltip(`Destrucción: ${effects.crater.destruction_radius_km}km radio`, {
                                permanent: false,
                                direction: 'top'
                            });

                            currentImpactOverlays.push(destructionCircle);
                        }
                    }

                    // Mostrar área sísmica si existe
                    if (effects.seismic && effects.seismic.felt_radius_km) {
                        const seismicRadius = effects.seismic.felt_radius_km * 1000; // convertir a metros
                        if (seismicRadius > 0) {
                            const seismicCircle = L.circle(center, {
                                color: '#ffa500',
                                fillColor: '#ffa500',
                                fillOpacity: 0.1,
                                weight: 1,
                                dashArray: '5, 5',
                                radius: seismicRadius
                            }).addTo(impactOverlaysLayer);

                            seismicCircle.bindTooltip(`Sísmico: ${effects.seismic.felt_radius_km}km radio`, {
                                permanent: false,
                                direction: 'top'
                            });

                            currentImpactOverlays.push(seismicCircle);
                        }
                    }
                }
            }
        });

        console.log(`✓ ${currentImpactOverlays.length} overlays de impacto creados`);

    } catch (error) {
        console.error('Error al crear overlays de impacto:', error);
    }
}

/**
 * Actualiza la visibilidad de los marcadores y overlays según filtro
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

    // Actualizar visibilidad de overlays de impacto
    updateImpactOverlaysVisibility(showOnlyHazardous);

    console.log(`Marcadores visibles: ${visibleCount}`);
    return visibleCount;
}

/**
 * Actualiza la visibilidad de los overlays de impacto según filtro
 * @param {boolean} showOnlyHazardous - Si es true, muestra solo peligrosos
 */
function updateImpactOverlaysVisibility(showOnlyHazardous) {
    // Por ahora, mostrar todos los overlays (podemos filtrar por peligrosidad más tarde)
    // Los overlays están asociados a marcadores, así que siguen la misma lógica
    currentImpactOverlays.forEach(overlay => {
        if (!map.hasLayer(overlay)) {
            overlay.addTo(impactOverlaysLayer);
        }
    });
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
