/**
 * Tooltip Controller Module
 * Sistema de tooltips educativos para términos técnicos
 */

// Contenido educativo de los tooltips
const educationalContent = {
    diameter: "Ancho del asteroide. Un asteroide de 200m es del tamaño de aproximadamente 2 campos de fútbol colocados uno tras otro.",

    velocity: "Velocidad de impacto contra la Tierra. Para comparar: un avión comercial vuela a 0.25 km/s, esto es hasta 100 veces más rápido.",

    mass: "Peso total del asteroide. Calculado asumiendo composición rocosa con densidad de 3000 kg/m³ (densidad típica de rocas terrestres).",

    hazardous: "Clasificación de NASA basada en tamaño (mayor a 140m) y proximidad orbital a la Tierra. Los asteroides peligrosos requieren monitoreo continuo.",

    energy: "Energía cinética liberada al momento del impacto. Se calcula usando la fórmula E = ½mv², donde m es la masa y v es la velocidad.",

    megatons: "Equivalente en bombas nucleares. 1 megatón TNT = 4.184 × 10¹⁵ joules. La bomba de Hiroshima fue de solo 0.015 megatones (15 kilotones).",

    seismic: "Magnitud en escala de Richter que produciría el impacto. Para comparar: terremoto de México 1985 fue 8.1, terremoto de Chile 2010 fue 8.8.",

    crater: "Tamaño estimado del cráter de impacto usando ecuaciones de Collins et al. El diámetro del cráter es típicamente 20-30 veces el diámetro del asteroide."
};

// Estado del tooltip
let tooltipContainer = null;
let tooltipContent = null;
let currentTooltipTarget = null;
let hideTimeout = null;

/**
 * Inicializa el sistema de tooltips
 */
function initTooltips() {
    console.log('Inicializando sistema de tooltips...');

    // Obtener referencias
    tooltipContainer = document.getElementById('tooltip-container');
    tooltipContent = tooltipContainer?.querySelector('.tooltip-content');

    // Agregar event listeners a todos los iconos de información
    const infoIcons = document.querySelectorAll('.info-icon');

    infoIcons.forEach(icon => {
        // Mouse events para desktop
        icon.addEventListener('mouseenter', handleTooltipShow);
        icon.addEventListener('mouseleave', handleTooltipHide);

        // Touch events para móvil
        icon.addEventListener('click', handleTooltipToggle);
    });

    // Cerrar tooltip al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('info-icon')) {
            hideTooltip();
        }
    });

    console.log(`✓ Sistema de tooltips inicializado (${infoIcons.length} tooltips)`);
}

/**
 * Maneja el evento de mostrar tooltip (hover)
 * @param {Event} event - Evento de mouse
 */
function handleTooltipShow(event) {
    const icon = event.target;
    const tooltipKey = icon.dataset.tooltip;

    if (!tooltipKey || !educationalContent[tooltipKey]) return;

    // Cancelar cualquier timeout de ocultar
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }

    showTooltip(icon, educationalContent[tooltipKey]);
}

/**
 * Maneja el evento de ocultar tooltip (hover out)
 */
function handleTooltipHide() {
    // Delay para dar tiempo a mover el mouse
    hideTimeout = setTimeout(() => {
        hideTooltip();
    }, 200);
}

/**
 * Maneja el toggle del tooltip (click en móvil)
 * @param {Event} event - Evento de click
 */
function handleTooltipToggle(event) {
    event.stopPropagation();

    const icon = event.target;
    const tooltipKey = icon.dataset.tooltip;

    if (!tooltipKey || !educationalContent[tooltipKey]) return;

    // Si el tooltip ya está visible para este icono, ocultarlo
    if (currentTooltipTarget === icon && tooltipContainer.style.display !== 'none') {
        hideTooltip();
    } else {
        showTooltip(icon, educationalContent[tooltipKey]);
    }
}

/**
 * Muestra el tooltip
 * @param {HTMLElement} targetElement - Elemento que activa el tooltip
 * @param {string} content - Contenido del tooltip
 */
function showTooltip(targetElement, content) {
    if (!tooltipContainer || !tooltipContent) return;

    // Establecer contenido
    tooltipContent.textContent = content;

    // Mostrar tooltip
    tooltipContainer.style.display = 'block';
    currentTooltipTarget = targetElement;

    // Posicionar tooltip
    positionTooltip(tooltipContainer, targetElement);
}

/**
 * Oculta el tooltip
 */
function hideTooltip() {
    if (tooltipContainer) {
        tooltipContainer.style.display = 'none';
        currentTooltipTarget = null;
    }
}

/**
 * Posiciona el tooltip relativo al elemento trigger
 * @param {HTMLElement} tooltip - Elemento del tooltip
 * @param {HTMLElement} trigger - Elemento que activó el tooltip
 */
function positionTooltip(tooltip, trigger) {
    // Obtener posición del trigger
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Calcular posición inicial (debajo del icono, centrado)
    let top = triggerRect.bottom + 10;
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Ajustar si se sale por la derecha
    const rightOverflow = (left + tooltipRect.width) - window.innerWidth;
    if (rightOverflow > 0) {
        left -= rightOverflow + 10;
    }

    // Ajustar si se sale por la izquierda
    if (left < 10) {
        left = 10;
    }

    // Ajustar si se sale por abajo
    const bottomOverflow = (top + tooltipRect.height) - window.innerHeight;
    if (bottomOverflow > 0) {
        // Mostrar arriba del icono
        top = triggerRect.top - tooltipRect.height - 10;

        // Invertir la flecha
        const arrow = tooltip.querySelector('.tooltip-arrow');
        if (arrow) {
            arrow.style.bottom = 'auto';
            arrow.style.top = '-6px';
            arrow.style.transform = 'translateX(-50%) rotate(225deg)';
        }
    } else {
        // Resetear flecha a posición normal
        const arrow = tooltip.querySelector('.tooltip-arrow');
        if (arrow) {
            arrow.style.top = 'auto';
            arrow.style.bottom = '-6px';
            arrow.style.transform = 'rotate(45deg)';

            // Posicionar flecha relativa al icono
            const arrowLeft = triggerRect.left + (triggerRect.width / 2) - left;
            arrow.style.left = `${arrowLeft}px`;
            arrow.style.marginLeft = '0';
        }
    }

    // Aplicar posición
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

/**
 * Actualiza las posiciones de los tooltips al hacer scroll
 */
function updateTooltipPositions() {
    if (currentTooltipTarget && tooltipContainer.style.display !== 'none') {
        positionTooltip(tooltipContainer, currentTooltipTarget);
    }
}

// Event listener para scroll (actualizar posición del tooltip)
if (typeof window !== 'undefined') {
    window.addEventListener('scroll', updateTooltipPositions, true);
    window.addEventListener('resize', () => {
        if (currentTooltipTarget) {
            hideTooltip();
        }
    });
}

/**
 * Agrega un nuevo tooltip dinámicamente
 * @param {string} key - Clave del tooltip
 * @param {string} content - Contenido educativo
 */
function addTooltipContent(key, content) {
    educationalContent[key] = content;
}

/**
 * Obtiene el contenido de un tooltip
 * @param {string} key - Clave del tooltip
 * @returns {string|null} Contenido del tooltip o null
 */
function getTooltipContent(key) {
    return educationalContent[key] || null;
}
