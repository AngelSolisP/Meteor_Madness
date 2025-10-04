/**
 * UI Controller Module
 * Maneja la interfaz de usuario y eventos
 */

// Datos de las etapas de alerta de meteorito
const ALERT_STAGES = [
    {
        title: "STAGE 1 — MONITOR MODE",
        level: "🟢 Alert Level: GREEN — No danger detected.",
        description: "\"The sky is being watched!\"",
        what: "Scientists around the world (IAWN) are scanning space for any object that might come close to Earth.",
        actions: [
            "Stay calm — meteors are common, but dangerous ones are rare.",
            "Follow trusted science pages (NASA, UN-SPIDER, local space agency).",
            "Don't believe viral rumors about \"end of the world\" stories online."
        ],
        criteria: "Esta etapa se activa cuando no hay objetos peligrosos detectados cerca de la Tierra. Los asteroides monitoreados están a una distancia segura y no representan amenaza alguna."
    },
    {
        title: "STAGE 2 — WATCH MODE",
        level: "🟡 Alert Level: YELLOW — Object under observation.",
        description: "\"Scientists found a rock — it's being checked!\"",
        what: "IAWN has spotted an asteroid passing near Earth. They're calculating its orbit to see if it might hit.",
        actions: [
            "Follow official updates — not social media panic.",
            "Listen for IAWN or government alerts.",
            "Schools, local leaders, and emergency agencies may start briefings."
        ],
        criteria: "Se activa cuando se detecta un asteroide que pasa cerca de la Tierra, pero aún no se confirma si impactará. La distancia es menor a la de la Etapa Verde, pero el riesgo de impacto es bajo (menos del 1%)."
    },
    {
        title: "STAGE 3 — ALERT MODE",
        level: "🟠 Alert Level: ORANGE — Prepare and stay alert.",
        description: "\"It might come close — we're preparing just in case.\"",
        what: "Impact probability is about 1–10%. Space experts (IAWN + SMPAG) and governments start emergency coordination.",
        actions: [
            "Stay tuned to official radio or online emergency channels.",
            "Learn your local shelter locations.",
            "Keep an emergency kit: water, flashlight, battery radio, first aid, important documents.",
            "Avoid spreading unverified information."
        ],
        criteria: "Probabilidad de impacto entre 1-10%. El asteroide está en trayectoria que podría golpear la Tierra. Se inicia coordinación internacional de emergencia y preparación civil."
    },
    {
        title: "STAGE 4 — IMPACT WARNING MODE",
        level: "🔴 Alert Level: RED — Take action immediately!",
        description: "\"Impact expected — follow safety instructions now!\"",
        what: "Scientists confirm the asteroid could strike Earth within days or weeks. Civil defense is active.",
        actions: [
            "Listen to official alerts only (TV, radio, phone notifications).",
            "If told to evacuate, do so calmly and quickly.",
            "If you cannot evacuate: Stay indoors, away from windows. Go to a basement or interior room. Lie flat and protect your head during the shockwave.",
            "Keep water and food for at least 72 hours."
        ],
        criteria: "Impacto confirmado con alta probabilidad (>10%) y tiempo estimado de días a semanas. Defensa civil activada, evacuaciones obligatorias en zonas de riesgo."
    },
    {
        title: "STAGE 5 — AFTER IMPACT",
        level: "🟢 Alert Level: GREEN — Recovery and support phase.",
        description: "\"The danger has passed — now we rebuild.\"",
        what: "The impact (if it occurs) may cause shockwaves, fires, or power outages. Rescue teams will move in.",
        actions: [
            "Wait for official \"all clear\" messages before leaving shelter.",
            "Help others safely; avoid damaged buildings or unknown debris.",
            "Follow instructions from emergency and health officials.",
            "Do not touch or go near meteor fragments — they can be hot or toxic."
        ],
        criteria: "Después del impacto (si ocurrió) o cuando el peligro ha pasado. Fase de recuperación con equipos de rescate activos. Se mantiene hasta que las autoridades declaren zona segura."
    }
];

// Escenarios para elegir nivel de alerta
const ALERT_SCENARIOS = [
    {
        scenario: "Los científicos de IAWN reportan que un asteroide de 500 metros pasará a 10 millones de kilómetros de la Tierra en 6 meses. No hay riesgo de impacto.",
        correctLevel: 0, // Index in ALERT_STAGES
        explanation: "Este es MONITOR MODE (Verde) porque el asteroide está a una distancia segura y no representa peligro alguno."
    },
    {
        scenario: "Se detecta un asteroide de 100 metros que pasará a 500,000 kilómetros de la Tierra. Los científicos están calculando su órbita con más precisión.",
        correctLevel: 1,
        explanation: "Este es WATCH MODE (Amarillo) porque el objeto está bajo observación, pero el riesgo de impacto es muy bajo."
    },
    {
        scenario: "Un asteroide de 200 metros tiene un 5% de probabilidad de impactar la Tierra en 3 meses. Gobiernos y expertos están coordinando planes de emergencia.",
        correctLevel: 2,
        explanation: "Este es ALERT MODE (Naranja) porque la probabilidad de impacto es baja (1-10%) pero requiere preparación preventiva."
    },
    {
        scenario: "Confirmado: asteroide impactará en 2 semanas con 80% de probabilidad. Defensa civil activada, evacuaciones en marcha.",
        correctLevel: 3,
        explanation: "Este es IMPACT WARNING MODE (Rojo) porque el impacto es inminente y requiere acción inmediata."
    },
    {
        scenario: "El asteroide ha impactado causando daños. Equipos de rescate están en la zona evaluando la situación.",
        correctLevel: 4,
        explanation: "Este es AFTER IMPACT (Verde de recuperación) porque el peligro inmediato ha pasado y comienza la fase de rescate."
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
