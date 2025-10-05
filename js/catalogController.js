/**
 * Catalog Controller Module
 * Gestiona el modal de catálogo completo de asteroides
 */

// Estado del catálogo
const CatalogState = {
    isOpen: false,
    allAsteroids: [],
    filteredAsteroids: [],
    searchTerm: '',
    showOnlyHazardous: false,
    sortCriteria: 'energy', // 'energy', 'diameter', 'velocity', 'name'
    sortOrder: 'desc'
};

// Referencias a elementos del DOM
let catalogModal = null;
let catalogTable = null;
let searchInput = null;
let hazardousFilter = null;
let sortSelect = null;
let closeButton = null;

/**
 * Inicializa el controlador del catálogo
 */
function initCatalog() {
    console.log('Inicializando catálogo...');

    // Obtener referencias
    catalogModal = document.getElementById('catalog-modal');
    catalogTable = document.getElementById('catalog-table-body');
    searchInput = document.getElementById('catalog-search');
    hazardousFilter = document.getElementById('catalog-filter-hazardous');
    sortSelect = document.getElementById('catalog-sort');
    closeButton = document.getElementById('catalog-close');

    // Event listeners
    const openButton = document.getElementById('btn-catalog');
    if (openButton) {
        openButton.addEventListener('click', openCatalog);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeCatalog);
    }

    // Backdrop click is handled by StateManager

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            CatalogState.searchTerm = e.target.value;
            applyFilters();
        });
    }

    if (hazardousFilter) {
        hazardousFilter.addEventListener('change', (e) => {
            CatalogState.showOnlyHazardous = e.target.checked;
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            CatalogState.sortCriteria = e.target.value;
            applyFilters();
        });
    }

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && CatalogState.isOpen) {
            closeCatalog();
        }
    });

    console.log('✓ Catálogo inicializado');
}

/**
 * Abre el modal del catálogo
 */
function openCatalog() {
    console.log('Abriendo catálogo...');

    // Use StateManager to handle modal opening
    UIStateManager.openModal('catalog');

    // Cargar asteroides si no están cargados
    if (CatalogState.allAsteroids.length === 0) {
        CatalogState.allAsteroids = getAllAsteroids();
        CatalogState.filteredAsteroids = [...CatalogState.allAsteroids];
    }

    // Aplicar filtros y renderizar
    applyFilters();

    // Mostrar modal
    if (catalogModal) {
        catalogModal.classList.add('active');
    }

    CatalogState.isOpen = true;

    // Focus trap and initial focus
    UIStateManager.trapFocus(catalogModal);
}

/**
 * Cierra el modal del catálogo
 */
function closeCatalog() {
    console.log('Cerrando catálogo...');

    // Use StateManager to handle modal closing
    UIStateManager.closeModal('catalog');

    if (catalogModal) {
        catalogModal.classList.remove('active');
    }

    CatalogState.isOpen = false;
}

/**
 * Aplica filtros y ordenamiento, luego renderiza
 */
function applyFilters() {
    let filtered = [...CatalogState.allAsteroids];

    // Filtro por nombre
    if (CatalogState.searchTerm) {
        const term = CatalogState.searchTerm.toLowerCase();
        filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(term) ||
            a.id.includes(term)
        );
    }

    // Filtro por peligrosidad
    if (CatalogState.showOnlyHazardous) {
        filtered = filtered.filter(a => a.is_hazardous === true);
    }

    // Ordenamiento
    filtered = sortBy(filtered, CatalogState.sortCriteria);

    CatalogState.filteredAsteroids = filtered;

    // Renderizar tabla
    renderCatalogTable(filtered);
}

/**
 * Ordena los asteroides según criterio
 * @param {Array} asteroids - Array de asteroides
 * @param {string} criteria - Criterio de ordenamiento
 * @returns {Array} Array ordenado
 */
function sortBy(asteroids, criteria) {
    const sorted = [...asteroids];

    switch (criteria) {
        case 'energy':
            sorted.sort((a, b) => {
                const energyA = a.impact_calculations?.tnt_megatons || 0;
                const energyB = b.impact_calculations?.tnt_megatons || 0;
                return energyB - energyA; // Mayor a menor
            });
            break;

        case 'diameter':
            sorted.sort((a, b) => {
                const diamA = a.physical_params?.diameter_avg_m || 0;
                const diamB = b.physical_params?.diameter_avg_m || 0;
                return diamB - diamA; // Mayor a menor
            });
            break;

        case 'velocity':
            sorted.sort((a, b) => {
                const velA = a.physical_params?.velocity_kms || 0;
                const velB = b.physical_params?.velocity_kms || 0;
                return velB - velA; // Mayor a menor
            });
            break;

        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;

        default:
            break;
    }

    return sorted;
}

/**
 * Renderiza la tabla del catálogo
 * @param {Array} asteroids - Array de asteroides a mostrar
 */
function renderCatalogTable(asteroids) {
    if (!catalogTable) return;

    // Limpiar tabla
    catalogTable.innerHTML = '';

    // Actualizar contador
    const counter = document.getElementById('catalog-count');
    if (counter) {
        counter.textContent = `${asteroids.length} asteroids`;
    }

    // Si no hay resultados
    if (asteroids.length === 0) {
        catalogTable.innerHTML = `
            <tr>
                <td colspan="5" class="no-results">
                    No asteroids found with the applied filters
                </td>
            </tr>
        `;
        return;
    }

    // Renderizar filas
    asteroids.forEach((asteroid, index) => {
        const row = createCatalogRow(asteroid, index);
        catalogTable.appendChild(row);
    });
}

/**
 * Crea una fila de la tabla del catálogo
 * @param {Object} asteroid - Datos del asteroide
 * @param {number} index - Índice en la lista
 * @returns {HTMLElement} Elemento TR
 */
function createCatalogRow(asteroid, index) {
    const tr = document.createElement('tr');
    tr.className = 'catalog-row';
    tr.dataset.asteroidId = asteroid.id;

    // Datos
    const name = asteroid.name || 'N/A';
    const diameter = asteroid.physical_params?.diameter_avg_m || 0;
    const velocity = asteroid.physical_params?.velocity_kms || 0;
    const energy = asteroid.impact_calculations?.tnt_megatons || 0;
    const isHazardous = asteroid.is_hazardous;

    // Formatear valores
    const diameterText = diameter > 0 ? `${diameter.toFixed(1)} m` : 'N/A';
    const velocityText = velocity > 0 ? `${velocity.toFixed(2)} km/s` : 'N/A';
    const energyText = formatEnergyValue(energy);

    // Icono de estado
    const statusIcon = isHazardous ? '🔴' : '🟡';
    const statusText = isHazardous ? 'Hazardous' : 'Not hazardous';

    // HTML de la fila
    tr.innerHTML = `
        <td class="catalog-cell-number">${index + 1}</td>
        <td class="catalog-cell-name">${name}</td>
        <td class="catalog-cell-value">${diameterText}</td>
        <td class="catalog-cell-value">${velocityText}</td>
        <td class="catalog-cell-value">${energyText}</td>
        <td class="catalog-cell-status">
            <span class="status-badge ${isHazardous ? 'hazardous' : 'safe'}">
                ${statusIcon} ${statusText}
            </span>
        </td>
    `;

    // Event listener para click
    tr.addEventListener('click', () => onRowClick(asteroid.id));

    return tr;
}

/**
 * Maneja el click en una fila del catálogo
 * @param {string} asteroidId - ID del asteroide
 */
function onRowClick(asteroidId) {
    console.log(`Seleccionado asteroide: ${asteroidId}`);

    // Obtener asteroide
    const asteroid = getAsteroidById(asteroidId);
    if (!asteroid) return;

    // Cerrar catálogo
    closeCatalog();

    // Centrar mapa en el asteroide
    if (asteroid.impact_scenario) {
        const lat = asteroid.impact_scenario.latitude;
        const lon = asteroid.impact_scenario.longitude;
        centerMap(lat, lon, 5);
    }

    // Resaltar marcador
    highlightMarker(asteroidId);

    // Mostrar panel de información
    if (typeof showAsteroidPanel === 'function') {
        showAsteroidPanel(asteroid);
    }
}

/**
 * Formatea el valor de energía para mostrar
 * @param {number} energy - Energía en megatones
 * @returns {string} Texto formateado
 */
function formatEnergyValue(energy) {
    if (energy === 0) return 'N/A';

    if (energy < 1) {
        // Mostrar en kilotones
        const kilotons = energy * 1000;
        return `${kilotons.toFixed(2)} KT`;
    } else if (energy < 1000) {
        // Mostrar en megatones
        return `${energy.toFixed(2)} MT`;
    } else if (energy < 1000000) {
        // Mostrar en gigatones
        const gigatons = energy / 1000;
        return `${gigatons.toFixed(2)} GT`;
    } else {
        // Mostrar en teratones
        const teratons = energy / 1000000;
        return `${teratons.toFixed(2)} TT`;
    }
}

/**
 * Reinicia los filtros del catálogo
 */
function resetFilters() {
    CatalogState.searchTerm = '';
    CatalogState.showOnlyHazardous = false;
    CatalogState.sortCriteria = 'energy';

    if (searchInput) searchInput.value = '';
    if (hazardousFilter) hazardousFilter.checked = false;
    if (sortSelect) sortSelect.value = 'energy';

    applyFilters();
}
