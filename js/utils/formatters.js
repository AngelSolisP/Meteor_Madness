// js/utils/formatters.js

/**
 * Funciones para formatear datos para display
 */

function formatEnergy(energyMT) {
    if (energyMT >= 1e6) {
        return `${(energyMT / 1e6).toFixed(2)} Teratones`;
    } else if (energyMT >= 1e3) {
        return `${(energyMT / 1e3).toFixed(2)} Gigatones`;
    } else if (energyMT >= 1) {
        return `${energyMT.toFixed(2)} Megatones`;
    } else {
        return `${(energyMT * 1000).toFixed(2)} Kilotones`;
    }
}

function formatDistance(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    } else {
        return `${meters.toFixed(0)} m`;
    }
}

function formatMass(kg) {
    if (kg >= 1e12) {
        return `${(kg / 1e12).toFixed(2)} billones de kg`;
    } else if (kg >= 1e9) {
        return `${(kg / 1e9).toFixed(2)} millones de kg`;
    } else if (kg >= 1e6) {
        return `${(kg / 1e6).toFixed(2)} toneladas`;
    } else if (kg >= 1e3) {
        return `${(kg / 1e3).toFixed(2)} kg`;
    } else {
        return `${kg.toFixed(2)} g`;
    }
}

function formatVelocity(kmps) {
    return `${kmps.toFixed(2)} km/s`;
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}

export { formatEnergy, formatDistance, formatMass, formatVelocity, formatDate, formatPercentage };
