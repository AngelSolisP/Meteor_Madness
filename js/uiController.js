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
        question: "What should you do if you see a rumor online?",
        options: [
            { text: "Share it with friends to warn them", correct: false },
            { text: "Check official sources first", correct: true },
            { text: "Panic and tell everyone", correct: false }
        ],
        feedback: {
            correct: "Good job! Checking official sources helps prevent unnecessary panic.",
            incorrect: "Wrong! Always verify information with official sources before spreading it."
        }
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
        question: "Where should you get your information from?",
        options: [
            { text: "Social media posts", correct: false },
            { text: "Official government or scientific sources", correct: true },
            { text: "Random websites", correct: false }
        ],
        feedback: {
            correct: "Excellent! Official sources provide accurate and timely information.",
            incorrect: "Incorrect! Social media can spread misinformation quickly."
        }
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
        question: "What should you prepare?",
        options: [
            { text: "Emergency supplies and know shelter locations", correct: true },
            { text: "Buy extra food and water", correct: false },
            { text: "Stockpile weapons", correct: false }
        ],
        feedback: {
            correct: "Perfect! Having emergency supplies ready is crucial for safety.",
            incorrect: "Not quite! Focus on practical emergency preparedness, not panic buying."
        }
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
        question: "What should you do if impact is imminent?",
        options: [
            { text: "Run outside to see it", correct: false },
            { text: "Follow official evacuation orders", correct: true },
            { text: "Hide in a closet or basement", correct: false }
        ],
        feedback: {
            correct: "Correct! Following official instructions saves lives.",
            incorrect: "Wrong! Never go outside during impact, and always follow evacuation orders."
        }
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
        question: "What should you do after the impact?",
        options: [
            { text: "Immediately go outside to check damage", correct: false },
            { text: "Wait for official all-clear signals", correct: true },
            { text: "Touch any interesting rocks you find", correct: false }
        ],
        feedback: {
            correct: "Great! Waiting for official confirmation ensures safety.",
            incorrect: "Dangerous! Always wait for authorities and avoid unknown debris."
        }
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
let currentStageIndex = 0;

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
        displayCurrentStage();
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

    // Actualizar acciones
    const actionsList = document.getElementById('stage-actions-list');
    actionsList.innerHTML = '';
    stage.actions.forEach(action => {
        const li = document.createElement('li');
        li.textContent = action;
        actionsList.appendChild(li);
    });

    // Actualizar pregunta
    document.getElementById('stage-question').querySelector('h4').textContent = stage.question;
    const optionsContainer = document.querySelector('.question-options');
    optionsContainer.innerHTML = '';
    stage.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.text;
        btn.dataset.correct = option.correct;
        btn.addEventListener('click', handleOptionClick);
        optionsContainer.appendChild(btn);
    });

    // Ocultar feedback inicialmente
    document.getElementById('stage-feedback').style.display = 'none';
    document.getElementById('stage-question').style.display = 'block';

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
