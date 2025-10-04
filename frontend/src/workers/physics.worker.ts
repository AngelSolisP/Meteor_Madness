/// <reference lib="webworker" />
function simulate(payload) {
  const { diameter_m, density, v_kms, angle_deg, lat, lng } = payload
  const r = diameter_m / 2
  const volume = (4/3) * Math.PI * Math.pow(r, 3)
  const mass = volume * density
  const v = v_kms * 1000
  const ke = 0.5 * mass * v * v
  const energy_mt = ke / (4.184e15)
  const crater_km = 1.161 * Math.pow(energy_mt, 1/3.4) * Math.pow(Math.sin(angle_deg * Math.PI/180), 1.3)
  const seismic_km = Math.max(5, Math.pow(energy_mt, 0.28) * 80)
  const profile = []; for (let d = 0; d <= 500; d+=10) profile.push({ d, ejecta: Math.max(0, (1 - d/500)) * energy_mt })
  const heat = []; for (let a = 0; a < 360; a += 4) { for (let d = 10; d <= 400; d += 20) {
    const weight = Math.max(0, 1 - d/400) * Math.min(1, energy_mt / 150)
    const lat2 = lat + (d/111) * Math.cos(a * Math.PI/180)
    const lng2 = lng + (d/(111*Math.cos(lat*Math.PI/180))) * Math.sin(a * Math.PI/180)
    heat.push({ lat: lat2, lng: lng2, weight })
  } }
  return { crater_km, energy_mt, seismic_km, profile, heat }
}
self.onmessage = (e) => {
  const { type, payload } = e.data
  if (type === 'init') postMessage({ type: 'ready' })
  if (type === 'simulate') postMessage({ type: 'result', out: simulate(payload) })
}
export {}