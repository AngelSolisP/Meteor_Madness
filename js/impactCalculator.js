/**
 * Impact Calculator Module
 * Contiene fórmulas para cálculos físicos de impactos de asteroides
 * Preparado para Fase 2 - Simulador
 */

// Constantes físicas
const CONSTANTS = {
    G: 6.67430e-11,                    // Constante gravitacional (m³/kg·s²)
    EARTH_RADIUS: 6371000,             // Radio terrestre (m)
    EARTH_MASS: 5.972e24,              // Masa terrestre (kg)
    HIROSHIMA_KILOTONS: 15,            // Bomba de Hiroshima (kilotones TNT)
    JOULES_TO_MEGATONS: 4.184e15,     // Conversión Joules a Megatones TNT
    DENSITY_ROCKY: 3000,               // Densidad asteroide rocoso (kg/m³)
    DENSITY_IRON: 7800,                // Densidad asteroide metálico (kg/m³)
    IMPACT_ANGLE_DEFAULT: 45,          // Ángulo de impacto por defecto (grados)
    SEISMIC_K1: 0.67,                  // Constante sísmica K1
    SEISMIC_K2: 3.87                   // Constante sísmica K2
};

/**
 * Calcula la masa de un asteroide dado su diámetro
 * @param {number} diameter_m - Diámetro en metros
 * @param {number} density_kg_m3 - Densidad en kg/m³ (por defecto 3000)
 * @returns {number} Masa en kilogramos
 */
function calculateMass(diameter_m, density_kg_m3 = CONSTANTS.DENSITY_ROCKY) {
    // Volumen de una esfera: V = (4/3) * π * r³
    const radius = diameter_m / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);

    // Masa = Volumen * Densidad
    const mass = volume * density_kg_m3;

    return mass;
}

/**
 * Calcula la energía cinética de un objeto en movimiento
 * @param {number} mass_kg - Masa en kilogramos
 * @param {number} velocity_ms - Velocidad en metros/segundo
 * @returns {number} Energía cinética en Joules
 */
function calculateKineticEnergy(mass_kg, velocity_ms) {
    // E = (1/2) * m * v²
    const energy = 0.5 * mass_kg * Math.pow(velocity_ms, 2);

    return energy;
}

/**
 * Convierte energía en Joules a equivalente TNT en megatones
 * @param {number} energy_j - Energía en Joules
 * @returns {number} Equivalente en Megatones TNT
 */
function calculateTNTEquivalent(energy_j) {
    // 1 Megatón TNT = 4.184 × 10¹⁵ Joules
    const megatons = energy_j / CONSTANTS.JOULES_TO_MEGATONS;

    return megatons;
}

/**
 * Calcula el diámetro del cráter resultante del impacto
 * Fórmula basada en Schmidt & Housen (1987)
 * @param {number} energy_j - Energía del impacto en Joules
 * @param {number} velocity_ms - Velocidad de impacto en m/s
 * @param {number} angle_deg - Ángulo de impacto en grados (por defecto 45°)
 * @returns {number} Diámetro del cráter en metros
 */
function calculateCraterDiameter(energy_j, velocity_ms, angle_deg = CONSTANTS.IMPACT_ANGLE_DEFAULT) {
    // Conversión a radianes
    const angle_rad = angle_deg * (Math.PI / 180);

    // Factor de ángulo: sin(θ)^(1/3)
    const angleFactor = Math.pow(Math.sin(angle_rad), 1 / 3);

    // Diámetro del cráter: D = 1.8 * (E^0.27) * (v^0.13) * angleFactor
    const diameter = 1.8 * Math.pow(energy_j, 0.27) * Math.pow(velocity_ms, 0.13) * angleFactor;

    return diameter;
}

/**
 * Estima la magnitud sísmica del impacto
 * Fórmula basada en Schultz & Gault (1975)
 * @param {number} energy_j - Energía del impacto en Joules
 * @returns {number} Magnitud en escala de Richter
 */
function estimateSeismicMagnitude(energy_j) {
    // Fórmula: M = (2/3) * log10(E) - 3.2
    // Ajustada para impactos: M = 0.67 * log10(E) - 3.87
    const magnitude = CONSTANTS.SEISMIC_K1 * Math.log10(energy_j) - CONSTANTS.SEISMIC_K2;

    // Limitar entre 0 y 10
    return Math.max(0, Math.min(10, magnitude));
}

/**
 * Calcula la velocidad de escape de un objeto
 * @param {number} mass_kg - Masa del objeto en kg
 * @param {number} radius_m - Radio del objeto en metros
 * @returns {number} Velocidad de escape en m/s
 */
function calculateEscapeVelocity(mass_kg, radius_m) {
    // v_escape = sqrt((2 * G * M) / r)
    const velocity = Math.sqrt((2 * CONSTANTS.G * mass_kg) / radius_m);

    return velocity;
}

/**
 * Estima el radio de destrucción total del impacto
 * @param {number} energy_megatons - Energía en megatones TNT
 * @returns {number} Radio de destrucción en kilómetros
 */
function estimateDestructionRadius(energy_megatons) {
    // Fórmula empírica: R = 3 * E^0.33 (en km)
    const radius_km = 3 * Math.pow(energy_megatons, 0.33);

    return radius_km;
}

/**
 * Estima la altura de ola de tsunami
 * @param {number} energy_megatons - Energía en megatones TNT
 * @param {number} ocean_depth_m - Profundidad del océano en metros
 * @returns {number} Altura estimada de ola en metros
 */
function estimateTsunamiWaveHeight(energy_megatons, ocean_depth_m) {
    // Fórmula simplificada: h = sqrt(E) * sqrt(depth) / 100
    const wave_height = Math.sqrt(energy_megatons) * Math.sqrt(ocean_depth_m) / 100;

    return wave_height;
}

/**
 * Calcula el radio de amenaza costera de un tsunami
 * @param {number} wave_height_m - Altura de la ola en metros
 * @returns {number} Radio de amenaza en kilómetros
 */
function calculateCoastalThreatRadius(wave_height_m) {
    // Radio aproximado: R = wave_height * 50 (empírico)
    const radius_km = wave_height_m * 50;

    return radius_km;
}

/**
 * Compara energía con eventos conocidos
 * @param {number} energy_megatons - Energía en megatones TNT
 * @returns {string} Descripción comparativa
 */
function compareToKnownEvents(energy_megatons) {
    const hiroshima_megatons = CONSTANTS.HIROSHIMA_KILOTONS / 1000; // 0.015 MT

    if (energy_megatons < 0.001) {
        return "Equivalente a un meteorito pequeño (menos de 1 kilotón)";
    } else if (energy_megatons < hiroshima_megatons) {
        const kilotons = energy_megatons * 1000;
        return `Equivalente a ${kilotons.toFixed(2)} kilotones TNT`;
    } else if (energy_megatons < 1) {
        const times_hiroshima = energy_megatons / hiroshima_megatons;
        return `Equivalente a ${times_hiroshima.toFixed(1)} bombas de Hiroshima (15 kilotones)`;
    } else if (energy_megatons < 50) {
        const times_hiroshima = energy_megatons / hiroshima_megatons;
        return `Equivalente a ${times_hiroshima.toFixed(0)} bombas de Hiroshima`;
    } else if (energy_megatons < 1000) {
        return `Evento de impacto regional (${energy_megatons.toFixed(0)} megatones)`;
    } else if (energy_megatons < 100000) {
        return `Evento de impacto continental (${(energy_megatons / 1000).toFixed(1)} gigatones)`;
    } else {
        return `Evento de extinción masiva (${(energy_megatons / 1000000).toFixed(2)} teratones)`;
    }
}

/**
 * Calcula todos los efectos de un impacto
 * @param {number} diameter_m - Diámetro del asteroide en metros
 * @param {number} velocity_ms - Velocidad en m/s
 * @param {number} density_kg_m3 - Densidad en kg/m³
 * @param {number} angle_deg - Ángulo de impacto en grados
 * @returns {Object} Objeto con todos los cálculos
 */
function calculateImpactEffects(diameter_m, velocity_ms, density_kg_m3 = CONSTANTS.DENSITY_ROCKY, angle_deg = CONSTANTS.IMPACT_ANGLE_DEFAULT) {
    const mass = calculateMass(diameter_m, density_kg_m3);
    const energy_j = calculateKineticEnergy(mass, velocity_ms);
    const energy_mt = calculateTNTEquivalent(energy_j);
    const crater_diameter = calculateCraterDiameter(energy_j, velocity_ms, angle_deg);
    const seismic_magnitude = estimateSeismicMagnitude(energy_j);
    const destruction_radius = estimateDestructionRadius(energy_mt);

    return {
        mass_kg: mass,
        kinetic_energy_j: energy_j,
        tnt_megatons: energy_mt,
        crater_diameter_m: crater_diameter,
        seismic_magnitude: seismic_magnitude,
        destruction_radius_km: destruction_radius,
        comparison: compareToKnownEvents(energy_mt)
    };
}

/**
 * Formatea un número grande con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
function formatLargeNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + ' mil millones';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + ' millones';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + ' mil';
    } else {
        return num.toFixed(2);
    }
}
