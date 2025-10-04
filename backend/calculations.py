import math

TNT_JOULE = 4.184e9  # Joules por tonelada de TNT
G_EARTH = 9.80665     # m/s^2

def sphere_mass(diameter_m: float, density_kg_m3: float) -> float:
    r = diameter_m / 2.0
    volume = (4.0/3.0) * math.pi * r**3
    return density_kg_m3 * volume

def kinetic_energy_joules(mass_kg: float, velocity_km_s: float) -> float:
    v = velocity_km_s * 1000.0
    return 0.5 * mass_kg * v**2

def tnt_equivalent_tons(E_j: float) -> float:
    return E_j / TNT_JOULE

def seismic_magnitude_mw(E_j: float) -> float:
    if E_j <= 0:
        return 0.0
    return (2.0/3.0) * (math.log10(E_j) - 4.8)

def crater_diameter_m(energy_tons_tnt: float, target_density_kg_m3: float = 2000.0, gravity=G_EARTH) -> float:
    if energy_tons_tnt <= 0:
        return 0.0
    k = 10.0  # factor de escala grosero
    D = k * (energy_tons_tnt ** (1.0/3.4))
    return D

def shock_radius_km(energy_tons_tnt: float) -> float:
    if energy_tons_tnt <= 0:
        return 0.0
    return 2.0 * (energy_tons_tnt ** 0.25)

def thermal_radius_km(energy_tons_tnt: float) -> float:
    if energy_tons_tnt <= 0:
        return 0.0
    return 3.0 * (energy_tons_tnt ** 0.22)
