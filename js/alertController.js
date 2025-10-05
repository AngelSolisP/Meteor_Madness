/**
 * Alert Controller Module
 * Maneja el sistema de alertas de meteoritos y la educación pública
 */

// Estado del sistema de alertas
const AlertState = {
    isOpen: false,
    currentStage: 1
};

// Referencias a elementos DOM
let alertModal = null;
let alertCloseBtn = null;
let stageNavButtons = [];
let alertStages = [];

/**
 * Inicializa el controlador de alertas
 */
function initAlertSystem() {
    try {
        console.log('Inicializando sistema de alertas...');

        // Obtener referencias a elementos DOM
        alertModal = document.getElementById('alert-modal');
        alertCloseBtn = document.getElementById('alert-close');

        // Obtener botones de navegación de etapas
        stageNavButtons = Array.from(document.querySelectorAll('.stage-nav-btn'));

        // Obtener todas las etapas
        alertStages = Array.from(document.querySelectorAll('.alert-stage'));

        // Validar elementos requeridos
        if (!alertModal || !alertCloseBtn) {
            throw new Error('No se encontraron todos los elementos del sistema de alertas');
        }

        // Event listeners
        setupEventListeners();

        console.log('✓ Sistema de alertas inicializado correctamente');

    } catch (error) {
        console.error('Error al inicializar sistema de alertas:', error);
        throw error;
    }
}

/**
 * Configura los event listeners del sistema de alertas
 */
function setupEventListeners() {
    // Botón de alerta en sidebar
    const alertBtn = document.getElementById('btn-alert');
    if (alertBtn) {
        alertBtn.addEventListener('click', openAlertModal);
    }

    // Botón de cerrar
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', closeAlertModal);
    }

    // Backdrop click and ESC key are handled by StateManager

    // Botones de navegación de etapas
    stageNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stage = parseInt(btn.dataset.stage);
            navigateToStage(stage);
        });
    });

    console.log('✓ Event listeners del sistema de alertas configurados');
}

/**
 * Abre el modal de alertas
 */
function openAlertModal() {
    console.log('Abriendo modal de alertas...');

    // Use StateManager to handle modal opening
    UIStateManager.openModal('alert');

    // Actualizar estado
    AlertState.isOpen = true;

    // Mostrar modal
    alertModal.classList.add('active');

    // Navegar a la primera etapa
    navigateToStage(1);

    // Focus trap
    UIStateManager.trapFocus(alertModal);

    console.log('✓ Modal de alertas abierto');
}

/**
 * Cierra el modal de alertas
 */
function closeAlertModal() {
    console.log('Cerrando modal de alertas...');

    // Use StateManager to handle modal closing
    UIStateManager.closeModal('alert');

    // Actualizar estado
    AlertState.isOpen = false;

    // Ocultar modal
    alertModal.classList.remove('active');

    console.log('✓ Modal de alertas cerrado');
}

/**
 * Navega a una etapa específica
 * @param {number} stageNumber - Número de etapa (1-6)
 */
function navigateToStage(stageNumber) {
    if (stageNumber < 1 || stageNumber > 6) {
        console.warn(`Etapa inválida: ${stageNumber}`);
        return;
    }

    console.log(`Navegando a etapa ${stageNumber}...`);

    // Actualizar estado
    AlertState.currentStage = stageNumber;

    // Actualizar botones de navegación
    stageNavButtons.forEach(btn => {
        const btnStage = parseInt(btn.dataset.stage);
        if (btnStage === stageNumber) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Mostrar etapa correspondiente
    alertStages.forEach((stage, index) => {
        if (index + 1 === stageNumber) {
            stage.classList.add('active');
        } else {
            stage.classList.remove('active');
        }
    });

    // Scroll al inicio del contenido
    const alertContent = alertModal.querySelector('.alert-content');
    if (alertContent) {
        alertContent.scrollTop = 0;
    }

    console.log(`✓ Navegado a etapa ${stageNumber}`);
}

/**
 * Obtiene el estado actual del sistema de alertas
 * @returns {Object} Estado del sistema
 */
function getAlertState() {
    return { ...AlertState };
}
