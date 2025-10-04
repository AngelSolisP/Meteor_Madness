/**
 * Chart Controller Module
 * Maneja la renderización de gráficas con Chart.js
 */

// Referencias a eventos y charts
const referenceEvents = {
    hiroshima: { name: "Hiroshima 1945", energy_mt: 0.015 },
    chelyabinsk: { name: "Chelyabinsk 2013", energy_mt: 0.5 },
    tunguska: { name: "Tunguska 1908", energy_mt: 12.5 }
};

// Almacenamiento de instancias de charts
let chartInstances = {
    comparison: null,
    distribution: null,
    scatter: null
};

// Estado actual
let currentAsteroidId = null;
let allAsteroidsData = [];

/**
 * Inicializa el controlador de gráficas
 */
function initCharts() {
    console.log('Inicializando controlador de gráficas...');

    // Event listeners para tabs
    const tabButtons = document.querySelectorAll('.chart-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const chartType = button.dataset.chart;
            switchChartTab(chartType);
        });
    });

    console.log('✓ Controlador de gráficas inicializado');
}

/**
 * Cambia entre tabs de gráficas
 * @param {string} chartType - Tipo de gráfica (comparison, distribution, scatter)
 */
function switchChartTab(chartType) {
    // Actualizar tabs activos
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

    // Actualizar canvas activos
    document.querySelectorAll('.chart-canvas').forEach(canvas => {
        canvas.classList.remove('active');
    });
    document.getElementById(`chart-${chartType}`).classList.add('active');
}

/**
 * Renderiza todas las gráficas para un asteroide
 * @param {Object} selectedAsteroid - Asteroide seleccionado
 * @param {Array} allAsteroids - Todos los asteroides
 */
function renderAllCharts(selectedAsteroid, allAsteroids) {
    console.log('Renderizando gráficas para:', selectedAsteroid.name);

    currentAsteroidId = selectedAsteroid.id;
    allAsteroidsData = allAsteroids;

    // Destruir gráficas anteriores
    destroyCharts();

    // Renderizar cada gráfica
    renderComparisonChart(selectedAsteroid);
    renderDistributionChart(allAsteroids);
    renderScatterChart(allAsteroids, selectedAsteroid.id);
}

/**
 * Renderiza gráfica de comparación de energía
 * @param {Object} selectedAsteroid - Asteroide seleccionado
 */
function renderComparisonChart(selectedAsteroid) {
    const ctx = document.getElementById('chart-comparison');
    if (!ctx) return;

    const energy = selectedAsteroid.impact_calculations?.tnt_megatons || 0;

    const data = {
        labels: [
            referenceEvents.hiroshima.name,
            referenceEvents.chelyabinsk.name,
            referenceEvents.tunguska.name,
            selectedAsteroid.name
        ],
        datasets: [{
            label: 'Energía (Megatones TNT)',
            data: [
                referenceEvents.hiroshima.energy_mt,
                referenceEvents.chelyabinsk.energy_mt,
                referenceEvents.tunguska.energy_mt,
                energy
            ],
            backgroundColor: [
                'rgba(78, 205, 196, 0.7)',  // Verde (Hiroshima)
                'rgba(255, 210, 63, 0.7)',   // Amarillo (Chelyabinsk)
                'rgba(255, 107, 53, 0.7)',   // Naranja (Tunguska)
                selectedAsteroid.is_hazardous
                    ? 'rgba(230, 57, 70, 0.9)'  // Rojo (Asteroide peligroso)
                    : 'rgba(255, 210, 63, 0.9)' // Amarillo (Asteroide seguro)
            ],
            borderColor: [
                'rgba(78, 205, 196, 1)',
                'rgba(255, 210, 63, 1)',
                'rgba(255, 107, 53, 1)',
                selectedAsteroid.is_hazardous
                    ? 'rgba(230, 57, 70, 1)'
                    : 'rgba(255, 210, 63, 1)'
            ],
            borderWidth: 2
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Comparación con Eventos Históricos',
                    color: '#b8c5d6',
                    font: {
                        size: 14,
                        weight: 'normal'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 81, 0.95)',
                    titleColor: '#ff6b35',
                    bodyColor: '#b8c5d6',
                    borderColor: '#ff6b35',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x;
                            if (value < 1) {
                                return ` ${(value * 1000).toFixed(2)} KT TNT`;
                            }
                            return ` ${value.toFixed(2)} MT TNT`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'logarithmic',
                    grid: {
                        color: 'rgba(184, 197, 214, 0.1)'
                    },
                    ticks: {
                        color: '#b8c5d6',
                        callback: function(value) {
                            if (value < 1) {
                                return (value * 1000).toFixed(0) + ' KT';
                            }
                            return value.toFixed(0) + ' MT';
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#b8c5d6',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    };

    chartInstances.comparison = new Chart(ctx, config);
}

/**
 * Renderiza gráfica de distribución (dona)
 * @param {Array} allAsteroids - Todos los asteroides
 */
function renderDistributionChart(allAsteroids) {
    const ctx = document.getElementById('chart-distribution');
    if (!ctx) return;

    const hazardous = allAsteroids.filter(a => a.is_hazardous).length;
    const nonHazardous = allAsteroids.length - hazardous;

    const data = {
        labels: ['Peligrosos', 'No Peligrosos'],
        datasets: [{
            data: [hazardous, nonHazardous],
            backgroundColor: [
                'rgba(230, 57, 70, 0.8)',
                'rgba(255, 210, 63, 0.8)'
            ],
            borderColor: [
                'rgba(230, 57, 70, 1)',
                'rgba(255, 210, 63, 1)'
            ],
            borderWidth: 2
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b8c5d6',
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: `Distribución de ${allAsteroids.length} Asteroides`,
                    color: '#b8c5d6',
                    font: {
                        size: 14,
                        weight: 'normal'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 81, 0.95)',
                    titleColor: '#ff6b35',
                    bodyColor: '#b8c5d6',
                    borderColor: '#ff6b35',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = allAsteroids.length;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };

    chartInstances.distribution = new Chart(ctx, config);
}

/**
 * Renderiza gráfica scatter de energía vs. diámetro
 * @param {Array} allAsteroids - Todos los asteroides
 * @param {string} selectedId - ID del asteroide seleccionado
 */
function renderScatterChart(allAsteroids, selectedId) {
    const ctx = document.getElementById('chart-scatter');
    if (!ctx) return;

    // Separar datos por peligrosidad
    const hazardousData = [];
    const nonHazardousData = [];
    let selectedPoint = null;

    allAsteroids.forEach(asteroid => {
        const diameter = asteroid.physical_params?.diameter_avg_m || 0;
        const energy = asteroid.impact_calculations?.tnt_megatons || 0;

        if (diameter === 0 || energy === 0) return;

        const point = {
            x: diameter,
            y: energy,
            label: asteroid.name
        };

        if (asteroid.id === selectedId) {
            selectedPoint = point;
        } else if (asteroid.is_hazardous) {
            hazardousData.push(point);
        } else {
            nonHazardousData.push(point);
        }
    });

    const datasets = [
        {
            label: 'Peligrosos',
            data: hazardousData,
            backgroundColor: 'rgba(230, 57, 70, 0.6)',
            borderColor: 'rgba(230, 57, 70, 1)',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7
        },
        {
            label: 'No Peligrosos',
            data: nonHazardousData,
            backgroundColor: 'rgba(255, 210, 63, 0.6)',
            borderColor: 'rgba(255, 210, 63, 1)',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7
        }
    ];

    // Agregar punto seleccionado con mayor tamaño
    if (selectedPoint) {
        datasets.push({
            label: 'Seleccionado',
            data: [selectedPoint],
            backgroundColor: 'rgba(255, 107, 53, 0.9)',
            borderColor: 'rgba(255, 107, 53, 1)',
            borderWidth: 3,
            pointRadius: 10,
            pointHoverRadius: 12,
            pointStyle: 'star'
        });
    }

    const config = {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b8c5d6',
                        font: {
                            size: 11
                        },
                        padding: 10,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'Energía vs. Diámetro',
                    color: '#b8c5d6',
                    font: {
                        size: 14,
                        weight: 'normal'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 81, 0.95)',
                    titleColor: '#ff6b35',
                    bodyColor: '#b8c5d6',
                    borderColor: '#ff6b35',
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.label || 'Asteroide';
                        },
                        label: function(context) {
                            return [
                                ` Diámetro: ${context.parsed.x.toFixed(1)} m`,
                                ` Energía: ${context.parsed.y.toFixed(2)} MT`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    grid: {
                        color: 'rgba(184, 197, 214, 0.1)'
                    },
                    ticks: {
                        color: '#b8c5d6',
                        callback: function(value) {
                            return value.toFixed(0) + ' m';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Diámetro (metros)',
                        color: '#7a8ba3',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    type: 'logarithmic',
                    grid: {
                        color: 'rgba(184, 197, 214, 0.1)'
                    },
                    ticks: {
                        color: '#b8c5d6',
                        callback: function(value) {
                            if (value < 1) {
                                return (value * 1000).toFixed(0) + ' KT';
                            }
                            return value.toFixed(0) + ' MT';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Energía (escala log)',
                        color: '#7a8ba3',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    };

    chartInstances.scatter = new Chart(ctx, config);
}

/**
 * Destruye todas las gráficas existentes
 */
function destroyCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            chartInstances[key] = null;
        }
    });
}

/**
 * Oculta las gráficas cuando se cierra el panel
 */
function hideCharts() {
    destroyCharts();
}
