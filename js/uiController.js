/**
 * UI Controller Module
 * Maneja la interfaz de usuario y eventos
 */

// Datos de las etapas de alerta de meteorito
const ALERT_STAGES = [
    {
        title: "ETAPA 1 — MODO MONITOREO",
        level: "🟢 Nivel de Alerta: VERDE — No se detecta peligro.",
        description: "\"¡El cielo está siendo vigilado!\"",
        what: "Científicos de todo el mundo (IAWN) escanean el espacio en busca de cualquier objeto que pueda acercarse a la Tierra.",
        actions: [
            "Mantén la calma — los meteoros son comunes, pero los peligrosos son raros.",
            "Sigue páginas científicas confiables (NASA, UN-SPIDER, agencia espacial local).",
            "No creas rumores virales sobre \"fin del mundo\" en línea."
        ],
        criteria: "Esta etapa se activa cuando no hay objetos que cumplan con los criterios de alerta establecidos por la IAWN. Los asteroides detectados están por debajo de los umbrales de tamaño (>10 metros de diámetro), probabilidad de impacto (>1%) o tiempo de aproximación. La densidad típica de los asteroides (rocosa ~3000 kg/m³ o metálica ~7800 kg/m³) se considera en las estimaciones de energía, pero los criterios se basan principalmente en el diámetro observado para evitar sesgos por variaciones en densidad."
    },
    {
        title: "ETAPA 2 — MODO VIGILANCIA",
        level: "🟡 Nivel de Alerta: AMARILLO — Objeto bajo observación.",
        description: "\"¡Los científicos encontraron una roca — la están revisando!\"",
        what: "La IAWN ha detectado un asteroide pasando cerca de la Tierra. Están calculando su órbita para ver si podría impactar.",
        actions: [
            "Sigue actualizaciones oficiales — no el pánico en redes sociales.",
            "Escucha alertas de IAWN o gobiernos.",
            "Escuelas, líderes locales y agencias de emergencia pueden iniciar sesiones informativas."
        ],
        criteria: "Se activa cuando se detecta un asteroide que podría acercarse peligrosamente, pero aún no cumple con los umbrales de alerta. Los objetos monitoreados pueden tener tamaños variables, pero la densidad influye en la masa y energía potencial: asteroides más densos (metálicos) generan más energía cinética que los rocosos del mismo tamaño. Esta etapa permite refinar las órbitas antes de escalar a alertas superiores."
    },
    {
        title: "ETAPA 3 — MODO ALERTA",
        level: "🟠 Nivel de Alerta: NARANJA — Prepárate y mantente alerta.",
        description: "\"Podría acercarse — nos estamos preparando por si acaso.\"",
        what: "La probabilidad de impacto es de aproximadamente 1-10%. Expertos espaciales (IAWN + SMPAG) y gobiernos inician coordinación de emergencia.",
        actions: [
            "Mantente atento a canales oficiales de radio o emergencia en línea.",
            "Aprende las ubicaciones de refugios locales.",
            "Mantén un kit de emergencia: agua, linterna, radio a batería, primeros auxilios, documentos importantes.",
            "Evita difundir información no verificada."
        ],
        criteria: "Se activa según los criterios de la IAWN para alertas de impacto: probabilidad >1% para objetos >10 metros (o magnitud absoluta 28), o para preparación terrestre: probabilidad >10%, tiempo <20 años, tamaño >20 metros (magnitud 27). La dimensión es crítica porque determina la energía de impacto (mayor diámetro = mayor masa, independientemente de la densidad exacta), y objetos más grandes pueden causar efectos globales como ondas de choque que llegan a la superficie."
    },
    {
        title: "ETAPA 4 — MODO ADVERTENCIA DE IMPACTO",
        level: "🔴 Nivel de Alerta: ROJO — ¡Toma acción inmediatamente!",
        description: "\"¡Impacto esperado — sigue las instrucciones de seguridad ahora!\"",
        what: "Los científicos confirman que el asteroide podría golpear la Tierra en días o semanas. La defensa civil está activa.",
        actions: [
            "Escucha solo alertas oficiales (TV, radio, notificaciones telefónicas).",
            "Si te indican evacuar, hazlo con calma y rapidez.",
            "Si no puedes evacuar: Quédate indoors, lejos de ventanas. Ve a un sótano o habitación interior. Acuéstate plano y protege tu cabeza durante la onda de choque.",
            "Mantén agua y comida para al menos 72 horas."
        ],
        criteria: "Impacto inminente con alta probabilidad (>10%) y tiempo estimado de días a semanas. Basado en criterios de IAWN donde la probabilidad supera el 1% para objetos >10 metros. La densidad afecta la masa (rocosa: ~3000 kg/m³ produce menos energía que metálica: ~7800 kg/m³), pero el diámetro es el indicador principal para clasificar la severidad, ya que asteroides más grandes generan cráteres mayores y efectos sísmicos más intensos."
    },
    {
        title: "ETAPA 5 — DESPUÉS DEL IMPACTO",
        level: "🟢 Nivel de Alerta: VERDE — Fase de recuperación y apoyo.",
        description: "\"El peligro ha pasado — ahora reconstruimos.\"",
        what: "El impacto (si ocurre) puede causar ondas de choque, incendios o cortes de energía. Los equipos de rescate intervendrán.",
        actions: [
            "Espera mensajes oficiales de \"todo despejado\" antes de salir del refugio.",
            "Ayuda a otros de manera segura; evita edificios dañados o escombros desconocidos.",
            "Sigue instrucciones de oficiales de emergencia y salud.",
            "No toques ni te acerques a fragmentos de meteorito — pueden estar calientes o tóxicos."
        ],
        criteria: "Después del impacto (si ocurrió) o cuando el peligro ha pasado. Los criterios previos ya no aplican, pero la evaluación post-impacto considera el tamaño real del objeto (diámetro y densidad) para entender los efectos observados, como el evento de Chelyabinsk (2013) con un asteroide de ~18 metros que causó daños significativos debido a su composición rocosa y velocidad."
    }
];

// Escenarios para elegir nivel de alerta
const ALERT_SCENARIOS = [
    {
        scenario: "Los científicos de IAWN reportan que un asteroide de 500 metros pasará a 10 millones de kilómetros de la Tierra en 6 meses. No hay riesgo de impacto.",
        correctLevel: 0, // Index in ALERT_STAGES
        explanation: "Este es MONITOR MODE (Verde) porque el asteroide está a una distancia segura y no representa peligro alguno. Su gran tamaño (>50m) normalmente activaría planificación SMPAG, pero la distancia elimina el riesgo."
    },
    {
        scenario: "Se detecta un asteroide de 100 metros que pasará a 500,000 kilómetros de la Tierra. Los científicos están calculando su órbita con más precisión.",
        correctLevel: 1,
        explanation: "Este es WATCH MODE (Amarillo) porque el objeto está bajo observación. Aunque mide 100m (por encima del umbral de 50m para SMPAG), la distancia y baja probabilidad lo mantienen en vigilancia."
    },
    {
        scenario: "Un asteroide de 200 metros tiene un 5% de probabilidad de impactar la Tierra en 3 meses. Gobiernos y expertos están coordinando planes de emergencia.",
        correctLevel: 2,
        explanation: "Este es ALERT MODE (Naranja) porque cumple criterios de preparación terrestre: >20m, >10% prob en <20 años. La densidad del asteroide (rocosa o metálica) amplifica su energía destructiva."
    },
    {
        scenario: "Confirmado: asteroide impactará en 2 semanas con 80% de probabilidad. Defensa civil activada, evacuaciones en marcha.",
        correctLevel: 3,
        explanation: "Este es IMPACT WARNING MODE (Rojo) porque supera el umbral IAWN de >1% prob para objetos >10m. El tamaño y densidad determinan la severidad del impacto esperado."
    },
    {
        scenario: "El asteroide ha impactado causando daños. Equipos de rescate están en la zona evaluando la situación.",
        correctLevel: 4,
        explanation: "Este es AFTER IMPACT (Verde de recuperación) porque el peligro inmediato ha pasado. La evaluación post-impacto revela cómo el diámetro y densidad reales afectaron los daños observados."
    }
];

// Referencias a elementos del DOM
let infoPanelElement = null;
let closePanelBtn = null;
let toggleHazardousCheckbox = null;
let asteroidCountElement = null;
let loadingElement = null;

// Referencias para simulador
let simulatorBackdrop = null;
let simulatorModal = null;
let simulatorCloseBtn = null;
let calculateBtn = null;

// Referencias para alerta
let alertBackdrop = null;
let alertModal = null;
let alertCloseBtn = null;
let alertPrevBtn = null;
let alertNextBtn = null;
let alertTabs = null;
let quizNextBtn = null;
let currentStageIndex = 0;
let currentScenarioIndex = 0;
let currentTab = 'guide';

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

    // Referencias para simulador
    simulatorBackdrop = document.getElementById('simulator-backdrop');
    simulatorModal = document.getElementById('simulator-modal');
    simulatorCloseBtn = document.getElementById('simulator-close');
    calculateBtn = document.getElementById('sim-calculate');

    // Referencias para alerta
    alertBackdrop = document.getElementById('alert-backdrop');
    alertModal = document.getElementById('alert-modal');
    alertCloseBtn = document.getElementById('alert-close');
    alertPrevBtn = document.getElementById('alert-prev');
    alertNextBtn = document.getElementById('alert-next');
    alertTabs = document.querySelectorAll('.alert-tab');
    quizNextBtn = document.getElementById('quiz-next');

    // Event listeners
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', hideAsteroidPanel);
    }

    if (toggleHazardousCheckbox) {
        toggleHazardousCheckbox.addEventListener('change', handleHazardousToggle);
    }

    // Event listeners para simulador
    const simulatorBtn = document.getElementById('btn-simulator');
    if (simulatorBtn) {
        simulatorBtn.addEventListener('click', showSimulatorModal);
    }

    if (simulatorCloseBtn) {
        simulatorCloseBtn.addEventListener('click', hideSimulatorModal);
    }

    if (simulatorBackdrop) {
        simulatorBackdrop.addEventListener('click', hideSimulatorModal);
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', handleSimulatorCalculation);
    }

    // Event listeners para alerta
    const alertBtn = document.getElementById('btn-alert');
    if (alertBtn) {
        alertBtn.addEventListener('click', showAlertModal);
    }

    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', hideAlertModal);
    }

    if (alertBackdrop) {
        alertBackdrop.addEventListener('click', hideAlertModal);
    }

    if (alertPrevBtn) {
        alertPrevBtn.addEventListener('click', goToPreviousStage);
    }

    if (alertNextBtn) {
        alertNextBtn.addEventListener('click', goToNextStage);
    }

    // Event listeners para tabs
    if (alertTabs) {
        alertTabs.forEach(tab => {
            tab.addEventListener('click', switchTab);
        });
    }

    // Event listeners para quiz
    if (quizNextBtn) {
        quizNextBtn.addEventListener('click', goToNextScenario);
    }

    // Event listeners para opciones de nivel
    document.addEventListener('click', handleLevelSelection);

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
        hazardBadge.textContent = 'Peligroso';
        hazardBadge.className = 'hazard-badge dangerous';
    } else {
        hazardBadge.textContent = 'No Peligroso';
        hazardBadge.className = 'hazard-badge safe';
    }

    // Energía de impacto
    const energy_mt = asteroidData.impact_calculations?.tnt_megatons;
    if (energy_mt) {
        document.getElementById('panel-energy').textContent = energy_mt.toLocaleString('es-ES', {
            maximumFractionDigits: 2
        });

        // Comparación con Hiroshima
        const comparison = compareToKnownEvents(energy_mt);
        document.getElementById('panel-comparison').textContent = comparison;
    } else {
        document.getElementById('panel-energy').textContent = 'N/A';
        document.getElementById('panel-comparison').textContent = 'No disponible';
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
        surface_type === 'ocean' ? 'Océano' :
        surface_type === 'land' ? 'Tierra' : 'N/A';

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

        const tsunamiText = `Altura de ola estimada: ${wave_height} m | ` +
                          `Radio de amenaza costera: ${threat_radius} km | ` +
                          `Nivel de riesgo: ${risk === 'high' ? 'Alto' : risk === 'moderate' ? 'Moderado' : 'Bajo'}`;

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
        return (num / 1e12).toFixed(2) + ' billones';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + ' mil millones';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + ' millones';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + ' mil';
    } else {
        return num.toFixed(2);
    }
}

/**
 * Muestra el modal del simulador
 */
function showSimulatorModal() {
    if (simulatorBackdrop && simulatorModal) {
        simulatorBackdrop.classList.add('active');
        simulatorModal.classList.add('active');
        console.log('Modal del simulador mostrado');
    }
}

/**
 * Oculta el modal del simulador
 */
function hideSimulatorModal() {
    if (simulatorBackdrop && simulatorModal) {
        simulatorBackdrop.classList.remove('active');
        simulatorModal.classList.remove('active');
        console.log('Modal del simulador ocultado');
    }
}

/**
 * Maneja el cálculo del simulador
 */
function handleSimulatorCalculation() {
    console.log('Iniciando cálculo del simulador...');

    // Obtener valores de los inputs
    const diameter = parseFloat(document.getElementById('sim-diameter').value);
    const velocity = parseFloat(document.getElementById('sim-velocity').value);
    const density = parseInt(document.getElementById('sim-density').value);
    const angle = parseFloat(document.getElementById('sim-angle').value);

    // Validar inputs
    if (!diameter || !velocity || !density || angle === null) {
        showError('Por favor, complete todos los campos con valores válidos.');
        return;
    }

    if (diameter < 1 || diameter > 10000) {
        showError('El diámetro debe estar entre 1 y 10,000 metros.');
        return;
    }

    if (velocity < 1 || velocity > 100) {
        showError('La velocidad debe estar entre 1 y 100 km/s.');
        return;
    }

    if (angle < 0 || angle > 90) {
        showError('El ángulo debe estar entre 0° y 90°.');
        return;
    }

    try {
        // Realizar cálculos usando las funciones del impactCalculator
        const results = calculateImpactEffects(diameter, velocity * 1000, density, angle); // velocity en m/s

        // Mostrar resultados
        displaySimulatorResults(results);

        console.log('Cálculo completado exitosamente:', results);
    } catch (error) {
        console.error('Error en el cálculo:', error);
        showError('Error al realizar los cálculos. Por favor, revise los valores.');
    }
}

/**
 * Muestra los resultados del simulador
 * @param {Object} results - Resultados del cálculo
 */
function displaySimulatorResults(results) {
    const resultsContainer = document.getElementById('simulator-results');

    // Mostrar contenedor de resultados
    resultsContainer.style.display = 'block';

    // Poblar resultados
    document.getElementById('sim-mass').textContent = formatLargeNumber(results.mass_kg) + ' kg';
    document.getElementById('sim-energy').textContent = formatLargeNumber(results.kinetic_energy_j) + ' J';
    document.getElementById('sim-tnt').textContent = results.tnt_megatons.toLocaleString('es-ES', {
        maximumFractionDigits: 2
    }) + ' MT';
    document.getElementById('sim-crater').textContent = results.crater_diameter_m.toFixed(2) + ' m';
    document.getElementById('sim-seismic').textContent = results.seismic_magnitude.toFixed(2);
    document.getElementById('sim-destruction').textContent = results.destruction_radius_km.toFixed(2) + ' km';
    document.getElementById('sim-comparison').textContent = results.comparison;

    // Scroll al área de resultados
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Muestra el modal de alerta
 */
function showAlertModal() {
    if (alertBackdrop && alertModal) {
        currentStageIndex = 0;
        currentScenarioIndex = 0;
        currentTab = 'guide';
        switchTabTo('guide');
        displayCurrentStage();
        displayCurrentScenario();
        alertBackdrop.classList.add('active');
        alertModal.classList.add('active');
        console.log('Modal de alerta mostrado');
    }
}

/**
 * Oculta el modal de alerta
 */
function hideAlertModal() {
    if (alertBackdrop && alertModal) {
        alertBackdrop.classList.remove('active');
        alertModal.classList.remove('active');
        console.log('Modal de alerta ocultado');
    }
}

/**
 * Muestra la etapa actual
 */
function displayCurrentStage() {
    const stage = ALERT_STAGES[currentStageIndex];

    // Actualizar título y nivel
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('alert-level').textContent = stage.level;

    // Actualizar descripción
    document.getElementById('stage-description').textContent = stage.description;
    document.getElementById('stage-what').textContent = stage.what;

    // Actualizar criterios
    document.getElementById('stage-criteria').textContent = stage.criteria;

    // Actualizar acciones
    const actionsList = document.getElementById('stage-actions-list');
    actionsList.innerHTML = '';
    stage.actions.forEach(action => {
        const li = document.createElement('li');
        li.textContent = action;
        actionsList.appendChild(li);
    });

    // Actualizar navegación
    document.getElementById('current-stage').textContent = currentStageIndex + 1;
    document.getElementById('total-stages').textContent = ALERT_STAGES.length;

    alertPrevBtn.disabled = currentStageIndex === 0;
    alertNextBtn.textContent = currentStageIndex === ALERT_STAGES.length - 1 ? 'Reiniciar' : 'Siguiente';
}

/**
 * Maneja el clic en una opción de pregunta
 */
function handleOptionClick(event) {
    const btn = event.target;
    const isCorrect = btn.dataset.correct === 'true';
    const stage = ALERT_STAGES[currentStageIndex];

    // Marcar botones
    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => {
        option.disabled = true;
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        } else {
            option.classList.add('incorrect');
        }
    });

    // Mostrar feedback
    const feedbackText = document.getElementById('feedback-text');
    feedbackText.textContent = isCorrect ? stage.feedback.correct : stage.feedback.incorrect;
    document.getElementById('stage-feedback').style.display = 'block';

    // Habilitar siguiente después de respuesta
    alertNextBtn.disabled = false;
}

/**
 * Va a la etapa anterior
 */
function goToPreviousStage() {
    if (currentStageIndex > 0) {
        currentStageIndex--;
        displayCurrentStage();
    }
}

/**
 * Va a la siguiente etapa
 */
function goToNextStage() {
    if (currentStageIndex < ALERT_STAGES.length - 1) {
        currentStageIndex++;
        displayCurrentStage();
    } else {
        // Reiniciar al final
        currentStageIndex = 0;
        displayCurrentStage();
    }
}

/**
 * Cambia entre tabs
 */
function switchTab(event) {
    const tab = event.target;
    const tabName = tab.dataset.tab;
    switchTabTo(tabName);
}

/**
 * Cambia a un tab específico
 */
function switchTabTo(tabName) {
    currentTab = tabName;

    // Actualizar tabs
    alertTabs.forEach(t => {
        if (t.dataset.tab === tabName) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });

    // Mostrar sección correspondiente
    document.querySelectorAll('.alert-section').forEach(section => {
        if (section.id === `${tabName}-section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

/**
 * Muestra el escenario actual
 */
function displayCurrentScenario() {
    const scenario = ALERT_SCENARIOS[currentScenarioIndex];

    document.getElementById('scenario-text').textContent = scenario.scenario;
    document.getElementById('scenario-feedback').style.display = 'none';

    // Resetear botones
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
    });

    // Actualizar indicador
    document.getElementById('current-scenario').textContent = currentScenarioIndex + 1;
    document.getElementById('total-scenarios').textContent = ALERT_SCENARIOS.length;
}

/**
 * Maneja la selección de nivel de alerta
 */
function handleLevelSelection(event) {
    if (!event.target.classList.contains('level-btn')) return;
    if (currentTab !== 'quiz') return;

    const selectedLevel = parseInt(event.target.dataset.level);
    const scenario = ALERT_SCENARIOS[currentScenarioIndex];
    const isCorrect = selectedLevel === scenario.correctLevel;

    // Marcar botones
    document.querySelectorAll('.level-btn').forEach(btn => {
        const level = parseInt(btn.dataset.level);
        btn.disabled = true;
        if (level === scenario.correctLevel) {
            btn.classList.add('correct');
        } else if (level === selectedLevel) {
            btn.classList.add('incorrect');
        }
    });

    // Mostrar feedback
    const feedbackResult = document.getElementById('feedback-result');
    const feedbackExplanation = document.getElementById('feedback-explanation');

    feedbackResult.textContent = isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto';
    feedbackResult.className = 'feedback-result ' + (isCorrect ? 'correct' : 'incorrect');
    feedbackExplanation.textContent = scenario.explanation;

    document.getElementById('scenario-feedback').style.display = 'block';
}

/**
 * Va al siguiente escenario
 */
function goToNextScenario() {
    if (currentScenarioIndex < ALERT_SCENARIOS.length - 1) {
        currentScenarioIndex++;
    } else {
        currentScenarioIndex = 0;
    }
    displayCurrentScenario();
}
