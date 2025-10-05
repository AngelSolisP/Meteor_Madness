/**
 * Simulator Controller Module
 * Maneja el simulador interactivo de impactos personalizados
 */

// Estado del simulador
const SimulatorState = {
    isActive: false,                 // Modo simulador activado
    isPanelOpen: false,              // Panel de configuración abierto
    impactLocation: null,            // { lat, lng }
    parameters: {
        diameter_m: 200,             // Diámetro en metros
        velocity_kms: 20,            // Velocidad en km/s
        angle_deg: 90,               // Ángulo de impacto
        density_kgm3: 3000           // Densidad (rocoso por defecto)
    },
    results: {
        mass_kg: 0,
        kinetic_energy_j: 0,
        tnt_megatons: 0,
        crater_diameter_m: 0,
        seismic_magnitude: 0,
        total_radius_km: 0,
        severe_radius_km: 0,
        moderate_radius_km: 0
    }
};

// Capas de Leaflet
let impactMarker = null;
let destructionCirclesLayer = null;

// Referencias DOM
let simulatorPanel = null;
let simulatorBtn = null;
let diameterSlider = null;
let velocitySlider = null;
let angleSlider = null;
let compositionRadios = null;

// Debounce timer
let calculationTimer = null;

/**
 * Inicializa el controlador del simulador
 */
function initSimulator() {
    console.log('Inicializando simulador...');

    // Obtener referencias DOM
    simulatorPanel = document.getElementById('simulator-panel');
    simulatorBtn = document.getElementById('btn-simulator');

    // Crear capa para círculos de destrucción
    const map = getMap();
    if (map) {
        destructionCirclesLayer = L.layerGroup();
    }

    // Event listeners se agregarán cuando el panel se abra
    console.log('✓ Simulador inicializado');
}

/**
 * Activa el modo simulador
 */
function activateSimulatorMode() {
    console.log('Activando modo simulador...');

    SimulatorState.isActive = true;

    // Cambiar apariencia del botón
    if (simulatorBtn) {
        simulatorBtn.classList.add('active');
        simulatorBtn.style.background = 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))';
    }

    // Cambiar cursor del mapa
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.cursor = 'crosshair';
    }

    // Cerrar panel de info si está abierto
    if (typeof hideAsteroidPanel === 'function') {
        hideAsteroidPanel();
    }

    // Limpiar círculos de asteroides si existen
    if (typeof clearAsteroidCircles === 'function') {
        clearAsteroidCircles();
    }

    // Cerrar catálogo si está abierto
    if (typeof closeCatalog === 'function') {
        closeCatalog();
    }

    // Agregar event listener para clicks en el mapa
    const map = getMap();
    if (map) {
        map.on('click', onMapClickSimulator);
    }

    // Mostrar mensaje instructivo
    console.log('✓ Modo simulador activado - Click en el mapa para seleccionar punto de impacto');
}

/**
 * Desactiva el modo simulador
 */
function deactivateSimulatorMode() {
    console.log('Desactivando modo simulador...');

    SimulatorState.isActive = false;

    // Restaurar apariencia del botón
    if (simulatorBtn) {
        simulatorBtn.classList.remove('active');
        simulatorBtn.style.background = '';
    }

    // Restaurar cursor del mapa
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.cursor = '';
    }

    // Remover event listener del mapa
    const map = getMap();
    if (map) {
        map.off('click', onMapClickSimulator);
    }

    // Cerrar panel si está abierto (sin llamar deactivate de nuevo)
    if (SimulatorState.isPanelOpen && simulatorPanel) {
        simulatorPanel.classList.remove('active');
        SimulatorState.isPanelOpen = false;
    }

    // Limpiar visualización
    clearSimulatorVisualization();

    console.log('✓ Modo simulador desactivado');
}

/**
 * Maneja click en el mapa cuando está en modo simulador
 * @param {Object} e - Evento de Leaflet
 */
function onMapClickSimulator(e) {
    if (!SimulatorState.isActive) return;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    console.log(`Punto de impacto seleccionado: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    // Guardar ubicación
    SimulatorState.impactLocation = { lat, lng };

    // Crear marcador de impacto
    createImpactMarker(lat, lng);

    // Abrir panel de configuración
    openSimulatorPanel(lat, lng);

    // Calcular resultados iniciales
    updateSimulation();
}

/**
 * Crea un marcador de impacto en el mapa
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
function createImpactMarker(lat, lng) {
    const map = getMap();
    if (!map) return;

    // Eliminar marcador anterior si existe
    if (impactMarker) {
        map.removeLayer(impactMarker);
    }

    // Crear icono personalizado
    const customIcon = L.divIcon({
        className: 'impact-marker',
        html: `<div style="
            background-color: #ff6b35;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 15px #ff6b35;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        ">🎯</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    // Crear marcador
    impactMarker = L.marker([lat, lng], {
        icon: customIcon,
        title: 'Punto de impacto simulado'
    });

    impactMarker.bindPopup('🎯 Punto de impacto simulado');
    impactMarker.addTo(map);

    // Centrar mapa en el punto
    map.setView([lat, lng], Math.max(map.getZoom(), 5));
}

/**
 * Abre el panel de configuración del simulador
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
function openSimulatorPanel(lat, lng) {
    if (!simulatorPanel) return;

    console.log('Abriendo panel de simulador...');

    // Mostrar ubicación
    document.getElementById('sim-latitude').textContent = lat.toFixed(4) + '°';
    document.getElementById('sim-longitude').textContent = lng.toFixed(4) + '°';

    // Determinar tipo de superficie (simplificado)
    const surfaceType = determineSurfaceType(lat, lng);
    document.getElementById('sim-surface-type').textContent = surfaceType;

    // Obtener referencias a sliders si no están
    if (!diameterSlider) {
        diameterSlider = document.getElementById('sim-diameter');
        velocitySlider = document.getElementById('sim-velocity');
        angleSlider = document.getElementById('sim-angle');
        compositionRadios = document.querySelectorAll('input[name="composition"]');

        // Agregar event listeners
        if (diameterSlider) {
            diameterSlider.addEventListener('input', onSliderChange);
        }
        if (velocitySlider) {
            velocitySlider.addEventListener('input', onSliderChange);
        }
        if (angleSlider) {
            angleSlider.addEventListener('input', onSliderChange);
        }
        compositionRadios.forEach(radio => {
            radio.addEventListener('change', onCompositionChange);
        });

        // Botón cerrar
        const closeBtn = document.getElementById('close-simulator-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSimulatorPanel);
        }

        // Botón comparar
        const compareBtn = document.getElementById('btn-compare');
        if (compareBtn) {
            compareBtn.addEventListener('click', openComparisonModal);
        }
    }

    // Establecer valores iniciales
    if (diameterSlider) diameterSlider.value = SimulatorState.parameters.diameter_m;
    if (velocitySlider) velocitySlider.value = SimulatorState.parameters.velocity_kms;
    if (angleSlider) angleSlider.value = SimulatorState.parameters.angle_deg;

    // Actualizar displays
    updateSliderDisplays();

    // Mostrar panel
    simulatorPanel.classList.add('active');
    SimulatorState.isPanelOpen = true;
}

/**
 * Cierra el panel del simulador
 */
function closeSimulatorPanel() {
    if (!simulatorPanel) return;

    console.log('Cerrando panel de simulador...');

    simulatorPanel.classList.remove('active');
    SimulatorState.isPanelOpen = false;

    // Limpiar visualización
    clearSimulatorVisualization();

    // Desactivar modo simulador (sin cerrar panel de nuevo)
    SimulatorState.isActive = false;

    // Restaurar apariencia del botón
    if (simulatorBtn) {
        simulatorBtn.classList.remove('active');
        simulatorBtn.style.background = '';
    }

    // Restaurar cursor del mapa
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.cursor = '';
    }

    // Remover event listener del mapa
    const map = getMap();
    if (map) {
        map.off('click', onMapClickSimulator);
    }
}

/**
 * Maneja cambios en los sliders
 * @param {Event} e - Evento del slider
 */
function onSliderChange(e) {
    const sliderId = e.target.id;
    const value = parseFloat(e.target.value);

    // Actualizar estado
    if (sliderId === 'sim-diameter') {
        SimulatorState.parameters.diameter_m = value;
    } else if (sliderId === 'sim-velocity') {
        SimulatorState.parameters.velocity_kms = value;
    } else if (sliderId === 'sim-angle') {
        SimulatorState.parameters.angle_deg = value;
    }

    // Actualizar displays
    updateSliderDisplays();

    // Recalcular con debounce
    if (calculationTimer) {
        clearTimeout(calculationTimer);
    }
    calculationTimer = setTimeout(() => {
        updateSimulation();
    }, 200);
}

/**
 * Maneja cambio de composición
 * @param {Event} e - Evento del radio button
 */
function onCompositionChange(e) {
    const value = e.target.value;

    // Actualizar densidad según composición
    if (value === 'rocky') {
        SimulatorState.parameters.density_kgm3 = 3000;
    } else if (value === 'metallic') {
        SimulatorState.parameters.density_kgm3 = 7800;
    } else if (value === 'ice') {
        SimulatorState.parameters.density_kgm3 = 917;
    }

    // Recalcular inmediatamente
    updateSimulation();
}

/**
 * Actualiza los displays de los sliders
 */
function updateSliderDisplays() {
    const diam = SimulatorState.parameters.diameter_m;
    const vel = SimulatorState.parameters.velocity_kms;
    const angle = SimulatorState.parameters.angle_deg;

    // Actualizar valores
    const diamValue = document.getElementById('sim-diameter-value');
    const velValue = document.getElementById('sim-velocity-value');
    const angleValue = document.getElementById('sim-angle-value');

    if (diamValue) diamValue.textContent = diam + ' m';
    if (velValue) velValue.textContent = vel + ' km/s';
    if (angleValue) angleValue.textContent = angle + '°';

    // Actualizar comparaciones
    const diamComp = document.getElementById('sim-diameter-comparison');
    if (diamComp) {
        if (diam < 50) {
            diamComp.textContent = 'Tamaño de 3-4 casas';
        } else if (diam < 150) {
            diamComp.textContent = '1 campo de fútbol';
        } else if (diam < 300) {
            diamComp.textContent = '2 campos de fútbol';
        } else if (diam < 500) {
            diamComp.textContent = '3-4 cuadras de ciudad';
        } else {
            diamComp.textContent = 'Varios bloques urbanos';
        }
    }

    const velComp = document.getElementById('sim-velocity-comparison');
    if (velComp) {
        if (vel < 10) {
            velComp.textContent = 'Velocidad baja';
        } else if (vel < 25) {
            velComp.textContent = 'Velocidad típica';
        } else {
            velComp.textContent = 'Velocidad extrema';
        }
    }

    const angleComp = document.getElementById('sim-angle-comparison');
    if (angleComp) {
        if (angle < 60) {
            angleComp.textContent = 'Impacto muy oblicuo';
        } else if (angle < 80) {
            angleComp.textContent = 'Impacto oblicuo';
        } else {
            angleComp.textContent = 'Impacto vertical (peor caso)';
        }
    }

    // Actualizar background de sliders
    updateSliderBackground(diameterSlider);
    updateSliderBackground(velocitySlider);
    updateSliderBackground(angleSlider);
}

/**
 * Actualiza el background del slider para mostrar progreso
 * @param {HTMLElement} slider - Elemento slider
 */
function updateSliderBackground(slider) {
    if (!slider) return;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = parseFloat(slider.value);
    const percent = ((value - min) / (max - min)) * 100;

    slider.style.background = `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${percent}%, #3a4a6b ${percent}%, #3a4a6b 100%)`;
}

/**
 * Calcula y actualiza los resultados del impacto
 */
function updateSimulation() {
    const params = SimulatorState.parameters;

    // Obtener parámetros
    const diameter_m = params.diameter_m;
    const velocity_ms = params.velocity_kms * 1000; // convertir a m/s
    const angle_deg = params.angle_deg;
    const density_kgm3 = params.density_kgm3;

    // Usar funciones de impactCalculator.js
    const mass_kg = calculateMass(diameter_m, density_kgm3);
    const kinetic_energy_j = calculateKineticEnergy(mass_kg, velocity_ms);
    const tnt_megatons = calculateTNTEquivalent(kinetic_energy_j);
    const crater_diameter_m = calculateCraterDiameter(kinetic_energy_j, velocity_ms, angle_deg);
    const seismic_magnitude = estimateSeismicMagnitude(kinetic_energy_j);

    // Calcular radios de destrucción
    const total_radius_km = Math.pow(tnt_megatons, 0.33) * 2;
    const severe_radius_km = total_radius_km * 2.1;
    const moderate_radius_km = severe_radius_km * 1.9;

    // Guardar resultados
    SimulatorState.results = {
        mass_kg,
        kinetic_energy_j,
        tnt_megatons,
        crater_diameter_m,
        seismic_magnitude,
        total_radius_km,
        severe_radius_km,
        moderate_radius_km
    };

    // Actualizar UI
    updateResultsDisplay();

    // Actualizar círculos en el mapa
    renderDestructionCircles();
}

/**
 * Actualiza el display de resultados en el panel
 */
function updateResultsDisplay() {
    const results = SimulatorState.results;

    // Masa
    const massElement = document.getElementById('sim-result-mass');
    if (massElement) {
        massElement.textContent = formatLargeNumber(results.mass_kg) + ' kg';
    }

    // Energía
    const energyElement = document.getElementById('sim-result-energy');
    if (energyElement) {
        energyElement.textContent = results.tnt_megatons.toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ' MT TNT';
    }

    // Cráter
    const craterElement = document.getElementById('sim-result-crater');
    if (craterElement) {
        craterElement.textContent = results.crater_diameter_m.toFixed(0) + ' m';
    }

    // Magnitud sísmica
    const seismicElement = document.getElementById('sim-result-seismic');
    if (seismicElement) {
        seismicElement.textContent = results.seismic_magnitude.toFixed(2);
    }

    // Radios de destrucción
    const totalRadiusElement = document.getElementById('sim-result-radius-total');
    const severeRadiusElement = document.getElementById('sim-result-radius-severe');
    const moderateRadiusElement = document.getElementById('sim-result-radius-moderate');

    if (totalRadiusElement) {
        totalRadiusElement.textContent = results.total_radius_km.toFixed(1) + ' km';
    }
    if (severeRadiusElement) {
        severeRadiusElement.textContent = results.severe_radius_km.toFixed(1) + ' km';
    }
    if (moderateRadiusElement) {
        moderateRadiusElement.textContent = results.moderate_radius_km.toFixed(1) + ' km';
    }

    // Comparación con eventos conocidos
    const comparisonElement = document.getElementById('sim-result-comparison');
    if (comparisonElement) {
        const comparison = compareToKnownEvents(results.tnt_megatons);
        comparisonElement.textContent = comparison;
    }
}

/**
 * Renderiza los círculos de destrucción en el mapa
 */
function renderDestructionCircles() {
    if (!destructionCirclesLayer || !SimulatorState.impactLocation) return;

    const map = getMap();
    if (!map) return;

    const lat = SimulatorState.impactLocation.lat;
    const lng = SimulatorState.impactLocation.lng;
    const results = SimulatorState.results;

    // Limpiar círculos anteriores
    destructionCirclesLayer.clearLayers();

    // Círculo 3 - Daño Moderado (más grande, se dibuja primero)
    L.circle([lat, lng], {
        radius: results.moderate_radius_km * 1000, // km a metros
        color: '#ffd700',
        fillColor: '#ffd700',
        fillOpacity: 0.1,
        weight: 2
    }).addTo(destructionCirclesLayer)
      .bindTooltip(`Daño moderado: ${results.moderate_radius_km.toFixed(1)} km`, { permanent: false });

    // Círculo 2 - Daño Severo
    L.circle([lat, lng], {
        radius: results.severe_radius_km * 1000,
        color: '#ff6b35',
        fillColor: '#ff6b35',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(destructionCirclesLayer)
      .bindTooltip(`Daño severo: ${results.severe_radius_km.toFixed(1)} km`, { permanent: false });

    // Círculo 1 - Destrucción Total (más pequeño, se dibuja último)
    L.circle([lat, lng], {
        radius: results.total_radius_km * 1000,
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(destructionCirclesLayer)
      .bindTooltip(`Destrucción total: ${results.total_radius_km.toFixed(1)} km`, { permanent: false });

    // Agregar capa al mapa
    destructionCirclesLayer.addTo(map);

    // Ajustar vista para mostrar todos los círculos
    const bounds = destructionCirclesLayer.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Mostrar leyenda
    showLegend();
}

/**
 * Limpia toda la visualización del simulador
 */
function clearSimulatorVisualization() {
    const map = getMap();
    if (!map) return;

    // Eliminar marcador
    if (impactMarker) {
        map.removeLayer(impactMarker);
        impactMarker = null;
    }

    // Eliminar círculos
    if (destructionCirclesLayer) {
        destructionCirclesLayer.clearLayers();
        map.removeLayer(destructionCirclesLayer);
    }

    // Ocultar leyenda
    hideLegend();

    console.log('Visualización del simulador limpiada');
}

/**
 * Determina el tipo de superficie (simplificado)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {string} 'Océano' o 'Tierra'
 */
function determineSurfaceType(lat, lng) {
    // Heurística simple: regiones oceánicas conocidas
    // Pacífico: lng entre -180 y -70
    // Atlántico: lng entre -70 and 20
    // Índico: lng entre 20 y 150

    // Simplificación: asumir tierra por defecto
    return 'Tierra (aproximado)';
}

/* ============================================
   COMPARISON MODAL FUNCTIONALITY
   ============================================ */

// Referencias DOM comparison modal
let comparisonModal = null;
let comparisonBackdrop = null;
let comparisonChart = null;

/**
 * Abre el modal de comparación
 */
function openComparisonModal() {
    if (!SimulatorState.impactLocation) {
        console.warn('No hay simulación activa');
        return;
    }

    console.log('Abriendo modal de comparación...');

    // Obtener referencias si no están
    if (!comparisonModal) {
        comparisonModal = document.getElementById('comparison-modal');
        comparisonBackdrop = document.getElementById('comparison-backdrop');

        // Event listeners
        const closeBtn = document.getElementById('comparison-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeComparisonModal);
        }
        if (comparisonBackdrop) {
            comparisonBackdrop.addEventListener('click', closeComparisonModal);
        }
    }

    // Poblar datos de simulación
    const params = SimulatorState.parameters;
    const results = SimulatorState.results;

    document.getElementById('comp-sim-diameter').textContent = params.diameter_m + ' m';
    document.getElementById('comp-sim-energy').textContent = results.tnt_megatons.toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ' MT';
    document.getElementById('comp-sim-crater').textContent = results.crater_diameter_m.toFixed(0) + ' m';

    // Encontrar asteroides similares
    const allAsteroids = getAllAsteroids();
    const similarAsteroids = findSimilarAsteroids(results.tnt_megatons, allAsteroids);

    // Renderizar tabla
    renderComparisonTable(similarAsteroids, results.tnt_megatons);

    // Renderizar gráfica
    renderSimulatorComparisonChart(similarAsteroids);

    // Calcular estadísticas
    const totalAsteroids = allAsteroids.length;
    const morePowerful = allAsteroids.filter(a => (a.impact_calculations?.tnt_megatons || 0) > results.tnt_megatons).length;
    const lessPowerful = totalAsteroids - morePowerful;
    const percentMore = ((morePowerful / totalAsteroids) * 100).toFixed(0);
    const percentLess = ((lessPowerful / totalAsteroids) * 100).toFixed(0);

    document.getElementById('comparison-stats-text').textContent =
        `🎯 Tu simulación es MÁS POTENTE que el ${percentLess}% del catálogo y MENOS POTENTE que el ${percentMore}%.`;

    // Mostrar modal
    if (comparisonBackdrop) comparisonBackdrop.classList.add('active');
    if (comparisonModal) comparisonModal.classList.add('active');
}

/**
 * Cierra el modal de comparación
 */
function closeComparisonModal() {
    if (comparisonBackdrop) comparisonBackdrop.classList.remove('active');
    if (comparisonModal) comparisonModal.classList.remove('active');

    // Destruir gráfica
    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }
}

/**
 * Encuentra asteroides similares por energía
 * @param {number} energy - Energía de la simulación en MT
 * @param {Array} asteroids - Array de asteroides
 * @returns {Array} Top 5 asteroides más similares
 */
function findSimilarAsteroids(energy, asteroids) {
    return asteroids
        .map(ast => ({
            ...ast,
            energyDiff: Math.abs((ast.impact_calculations?.tnt_megatons || 0) - energy)
        }))
        .sort((a, b) => a.energyDiff - b.energyDiff)
        .slice(0, 5);
}

/**
 * Renderiza la tabla de comparación
 * @param {Array} asteroids - Asteroides similares
 * @param {number} simEnergy - Energía de la simulación
 */
function renderComparisonTable(asteroids, simEnergy) {
    const tbody = document.getElementById('comparison-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    asteroids.forEach(asteroid => {
        const row = document.createElement('tr');
        row.className = 'catalog-row';

        const name = asteroid.name || 'N/A';
        const diameter = asteroid.physical_params?.diameter_avg_m || 0;
        const energy = asteroid.impact_calculations?.tnt_megatons || 0;
        const diff = ((energy - simEnergy) / simEnergy * 100).toFixed(1);
        const diffText = diff > 0 ? `+${diff}%` : `${diff}%`;
        const diffClass = diff > 0 ? 'positive' : 'negative';

        row.innerHTML = `
            <td class="catalog-cell-name">${name}</td>
            <td class="catalog-cell-value">${diameter.toFixed(1)} m</td>
            <td class="catalog-cell-value">${formatEnergyValue(energy)}</td>
            <td class="catalog-cell-value ${diffClass}">${diffText}</td>
        `;

        tbody.appendChild(row);
    });
}

/**
 * Renderiza la gráfica de comparación del simulador
 * @param {Array} asteroids - Asteroides similares
 */
function renderSimulatorComparisonChart(asteroids) {
    const canvas = document.getElementById('comparison-chart');
    if (!canvas) return;

    // Destruir gráfica anterior
    if (comparisonChart) {
        comparisonChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Preparar datos
    const labels = ['Tu Simulación', ...asteroids.map(a => a.name)];
    const data = [
        SimulatorState.results.tnt_megatons,
        ...asteroids.map(a => a.impact_calculations?.tnt_megatons || 0)
    ];
    const backgroundColors = [
        '#ff6b35', // Simulación en naranja
        '#e63946',
        '#f77f00',
        '#fcbf49',
        '#eae2b7',
        '#d4a373'
    ];

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Energía (MT TNT)',
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderColor: backgroundColors.slice(0, data.length),
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Energía: ${context.parsed.x.toLocaleString('es-ES', { maximumFractionDigits: 2 })} MT TNT`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Energía (Megatones TNT)',
                        color: '#b8c5d6'
                    },
                    ticks: {
                        color: '#b8c5d6',
                        callback: function(value) {
                            if (value === 0.01 || value === 0.1 || value === 1 || value === 10 || value === 100 || value === 1000 || value === 10000 || value === 100000) {
                                return value.toLocaleString('es-ES');
                            }
                            return '';
                        }
                    },
                    grid: {
                        color: 'rgba(184, 197, 214, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#b8c5d6'
                    },
                    grid: {
                        color: 'rgba(184, 197, 214, 0.1)'
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        }
    });
}

/* ============================================
   LEGEND FUNCTIONALITY
   ============================================ */

/**
 * Muestra la leyenda flotante
 */
function showLegend() {
    const legend = document.getElementById('impact-legend');
    if (legend) {
        legend.style.display = 'block';
    }
}

/**
 * Oculta la leyenda flotante
 */
function hideLegend() {
    const legend = document.getElementById('impact-legend');
    if (legend) {
        legend.style.display = 'none';
    }
}
