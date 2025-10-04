use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ImpactOut { pub crater_km: f64, pub energy_mt: f64 }

#[wasm_bindgen]
pub fn simulate_impact(diameter_m: f64, density: f64, v_kms: f64, angle_deg: f64) -> ImpactOut {
    let r = diameter_m / 2.0;
    let volume = (4.0/3.0) * std::f64::consts::PI * r.powi(3);
    let mass = volume * density;
    let v = v_kms * 1000.0;
    let ke = 0.5 * mass * v * v;
    let tnt_mt = ke / (4.184e15);
    let crater_km = 1.161 * tnt_mt.powf(1.0/3.4) * (angle_deg.to_radians().sin().powf(1.3));
    ImpactOut { crater_km, energy_mt: tnt_mt }
}