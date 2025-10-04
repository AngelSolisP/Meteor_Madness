
import { loadNEOs, fillSelect, describeNEO } from "./dataset.js";
import { simulateImpact, neowsBrowse, elevation } from "./api.js";
import { keplerOrbitPoints } from "./orbit.js";
import { updateCharts } from "./charts.js";


const map = L.map('map').setView([20.9671, -89.5926], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

let impactMarker = null;
let shockCircle = null;
let thermalCircle = null;

map.on('click', (e) => {
  const {lat, lng} = e.latlng;
  latEl.value = lat.toFixed(4);
  lonEl.value = lng.toFixed(4);
});

function setMarker(lat, lon) {
  if (impactMarker) impactMarker.remove();
  impactMarker = L.marker([lat, lon]).addTo(map).bindPopup("Impacto");
  map.setView([lat, lon], 6);
}

function setZones(lat, lon, shock_km, thermal_km) {
  if (shockCircle) shockCircle.remove();
  if (thermalCircle) thermalCircle.remove();
  shockCircle = L.circle([lat, lon], {radius: shock_km*1000, color: '#f97316', fillOpacity: 0.1}).addTo(map);
  thermalCircle = L.circle([lat, lon], {radius: thermal_km*1000, color: '#ef4444', fillOpacity: 0.08}).addTo(map);
}

const diameterEl = document.getElementById("diameter");
const densityEl = document.getElementById("density");
const velocityEl = document.getElementById("velocity");
const angleEl = document.getElementById("angle");
const targetEl = document.getElementById("target");
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const resEl = document.getElementById("results");

const dVal = document.getElementById("diameter-val");
const denVal = document.getElementById("density-val");
const vVal = document.getElementById("velocity-val");
const aVal = document.getElementById("angle-val");

const updateLabels = () => {
  dVal.textContent = diameterEl.value;
  denVal.textContent = densityEl.value;
  vVal.textContent = Number(velocityEl.value).toFixed(1);
  aVal.textContent = angleEl.value;
};
["input","change"].forEach(ev=>{
  diameterEl.addEventListener(ev, updateLabels);
  densityEl.addEventListener(ev, updateLabels);
  velocityEl.addEventListener(ev, updateLabels);
  angleEl.addEventListener(ev, updateLabels);
});
updateLabels();

document.getElementById("simulate").addEventListener("click", async () => {
  const payload = {
    diameter_m: Number(diameterEl.value),
    density_kg_m3: Number(densityEl.value),
    velocity_km_s: Number(velocityEl.value),
    angle_deg: Number(angleEl.value),
    lat: Number(latEl.value),
    lon: Number(lonEl.value),
    target: targetEl.value,
  };
  const data = await simulateImpact(payload);
  const d = data.derived;
  setMarker(payload.lat, payload.lon);
  setZones(payload.lat, payload.lon, d.shock_radius_km, d.thermal_radius_km);

  let elevTxt = "";
  try {
    const elev = await elevation(payload.lat, payload.lon);
    const out = elev?.value?.elevation || elev?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation;
    if (out !== undefined) elevTxt = `Elevación: ${out} m`;
  } catch(e){}

  resEl.innerHTML = `
Energía (J): ${d.energy_joules.toExponential(4)}
TNT (ton): ${d.tnt_tons.toExponential(4)}
Masa (kg): ${d.mass_kg.toExponential(4)}
Mw equiv.: ${d.seismic_Mw_equiv.toFixed(2)}
Cráter (m): ${d.crater_diameter_m.toFixed(1)}
Radio onda choque (km): ${d.shock_radius_km.toFixed(2)}
Radio térmico (km): ${d.thermal_radius_km.toFixed(2)}
Riesgo de tsunami: ${d.tsunami_risk ? "Sí" : "No"}
${elevTxt ? elevTxt : ""}
`.trim().replace(/\n/g,"<br>");
});

updateCharts({
  energy_joules: d.energy_joules,
  tnt_tons: d.tnt_tons,
  shock_radius_km: d.shock_radius_km,
  thermal_radius_km: d.thermal_radius_km,
  seismic_Mw_equiv: d.seismic_Mw_equiv,
  crater_diameter_m: d.crater_diameter_m
});

const canvas = document.getElementById("orbitCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.getElementById("drawOrbit").addEventListener("click", () => {
  const a = Number(document.getElementById("a").value);
  const e = Number(document.getElementById("e").value);
  const i = Number(document.getElementById("i").value);
  const Omega = Number(document.getElementById("Omega").value);
  const omega = Number(document.getElementById("omega").value);
  const M = Number(document.getElementById("M").value);
  const pts = keplerOrbitPoints(a, e, i, Omega, omega, M, 360);

  ctx.clearRect(0,0,canvas.width,canvas.height);
  const xs = pts.map(p=>p[0]), ys = pts.map(p=>p[1]);
  const minX=Math.min(...xs), maxX=Math.max(...xs);
  const minY=Math.min(...ys), maxY=Math.max(...ys);
  const pad=20*devicePixelRatio;
  const W=canvas.width, H=canvas.height;
  const sx=(W-2*pad)/(maxX-minX||1), sy=(H-2*pad)/(maxY-minY||1);
  const s = Math.min(sx, sy);
  ctx.beginPath();
  pts.forEach(([x,y],idx)=>{
    const X = (x - minX)*s + pad;
    const Y = (y - minY)*s + pad;
    if (idx===0) ctx.moveTo(X,H-Y); else ctx.lineTo(X,H-Y);
  });
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2*devicePixelRatio;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W/2, H/2, 4*devicePixelRatio, 0, Math.PI*2);
  ctx.fillStyle="#fbbf24";
  ctx.fill();
});

import { initOrbit3D } from './orbit3d_app.js';
window.addEventListener('load', initOrbit3D);


async function initDataset(){
  const select = document.getElementById("neoSelect");
  const info = document.getElementById("neoInfo");
  if (!select) return;
  const neos = await loadNEOs();
  fillSelect(select, neos);

  const current = ()=> neos.find(n => n.id === select.value);

  select.addEventListener('change', ()=>{
    const n = current();
    info.textContent = n ? describeNEO(n) : '';
  });

  document.getElementById("loadNeo").addEventListener("click", ()=>{
    const n = current();
    if (!n) return;
    // Rellenar parámetros físicos
    if (n.physical_params){
      if (typeof n.physical_params.diameter_avg_m === 'number') diameterEl.value = n.physical_params.diameter_avg_m.toFixed(0);
      if (typeof n.physical_params.density_kgm3 === 'number') densityEl.value = n.physical_params.density_kgm3.toFixed(0);
      if (typeof n.physical_params.velocity_kms === 'number') velocityEl.value = n.physical_params.velocity_kms.toFixed(1);
      updateLabels();
    }
    // Órbita (usa a,e,i,Ω,ω,M)
    const od = n.orbital_data || {};
    const setIfNum = (id, val)=> { if (typeof val === 'number' && !Number.isNaN(val)) document.getElementById(id).value = val.toFixed(6); };
    setIfNum('a', od.semi_major_axis_au);
    setIfNum('e', od.eccentricity);
    setIfNum('i', od.inclination_deg);
    setIfNum('Omega', od.ascending_node_longitude_deg);
    setIfNum('omega', od.perihelion_argument_deg);
    setIfNum('M', od.mean_anomaly_deg);

    // Punto de impacto sugerido
    const sc = n.impact_scenario || {};
    if (typeof sc.latitude === 'number') latEl.value = sc.latitude.toFixed(6);
    if (typeof sc.longitude === 'number') lonEl.value = sc.longitude.toFixed(6);
    const surf = n.impact_effects?.surface_type;
    if (surf === 'ocean') targetEl.value = 'water';
    else if (surf === 'land') targetEl.value = 'land';

    // Centrar mapa y marcar
    setMarker(Number(latEl.value), Number(lonEl.value));

    // Dibujar órbita 2D y 3D
    document.getElementById("drawOrbit").click();
    const applyBtn = document.getElementById("applyDv");
    if (applyBtn) applyBtn.click();

    info.textContent = describeNEO(n);
  });

  // Trigger initial info
  select.dispatchEvent(new Event('change'));
}
window.addEventListener('load', initDataset);


import { sbdbQuery, neowsGetById } from "./api.js";

async function doSearch(){
  const src = document.getElementById("searchSource").value;
  const s = document.getElementById("searchId").value.trim();
  const out = document.getElementById("searchResult");
  out.textContent = "Buscando...";
  try{
    if (src === "sbdb"){
      const data = await sbdbQuery({ sstr: s, orb: 1, phys: 1 });
      // Map SBDB response to our fields
      const od = data.orbit && data.orbit.elements ? data.orbit.elements : null;
      const phys = data.phys_par ? data.phys_par : {};
      // Extract common elements
      const a = Number(od?.find(e=>e.name==="a")?.value);
      const e = Number(od?.find(e=>e.name==="e")?.value);
      const i = Number(od?.find(e=>e.name==="i")?.value);
      const Omega = Number(od?.find(e=>e.name==="Omega")?.value);
      const omega = Number(od?.find(e=>e.name==="w")?.value);
      const M = Number(od?.find(e=>e.name==="M")?.value);
      if (!Number.isFinite(a)) throw new Error("No se pudieron leer los elementos orbitales");
      document.getElementById("a").value = a;
      document.getElementById("e").value = e;
      document.getElementById("i").value = i;
      document.getElementById("Omega").value = Omega;
      document.getElementById("omega").value = omega;
      document.getElementById("M").value = M;
      // Physical params (best-effort)
      if (Number.isFinite(phys.diameter)) diameterEl.value = (Number(phys.diameter)*1000).toFixed(0); // km -> m
      updateLabels();
      out.textContent = `Cargado desde SBDB: a=${a} AU, e=${e}, i=${i}°`;
      document.getElementById("drawOrbit").click();
      const applyBtn = document.getElementById("applyDv"); if (applyBtn) applyBtn.click();
    } else {
      const n = await neowsGetById(s);
      const od = n.orbital_data || {};
      if (!od) throw new Error("Sin datos orbitales de NeoWs");
      document.getElementById("a").value = Number(od.semi_major_axis).toFixed(6);
      document.getElementById("e").value = Number(od.eccentricity).toFixed(6);
      document.getElementById("i").value = Number(od.inclination).toFixed(6);
      document.getElementById("Omega").value = Number(od.ascending_node_longitude).toFixed(6);
      document.getElementById("omega").value = Number(od.perihelion_argument).toFixed(6);
      document.getElementById("M").value = Number(od.mean_anomaly).toFixed(6);
      // Estimate diameter if present
      const est = n.estimated_diameter?.meters;
      if (est && Number.isFinite(est.estimated_diameter_max)){
        diameterEl.value = est.estimated_diameter_max.toFixed(0);
        updateLabels();
      }
      out.textContent = `Cargado desde NeoWs: ${n.name}`;
      document.getElementById("drawOrbit").click();
      const applyBtn = document.getElementById("applyDv"); if (applyBtn) applyBtn.click();
    }
  }catch(err){
    out.textContent = "Error: " + err.message;
  }
}
function scenarioJSON(){
  const payload = {
    scenario_name: document.getElementById("scenarioName").value || "scenario",
    asteroid: {
      diameter_m: Number(diameterEl.value),
      density_kg_m3: Number(densityEl.value),
      velocity_km_s: Number(velocityEl.value),
      angle_deg: Number(angleEl.value)
    },
    impact: {
      lat: Number(latEl.value),
      lon: Number(lonEl.value),
      target: targetEl.value
    },
    orbit: {
      a_AU: Number(document.getElementById("a").value),
      e: Number(document.getElementById("e").value),
      i_deg: Number(document.getElementById("i").value),
      Omega_deg: Number(document.getElementById("Omega").value),
      omega_deg: Number(document.getElementById("omega").value),
      M_deg: Number(document.getElementById("M").value)
    }
  };
  return payload;
}
function download(filename, text){
  const blob = new Blob([text], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
}

document.addEventListener("DOMContentLoaded", () => {
  const btnSearch = document.getElementById("btnSearch");
  if (btnSearch) btnSearch.addEventListener("click", doSearch);

  const btnJSON = document.getElementById("btnExportJSON");
  const btnGEO = document.getElementById("btnExportGeoJSON");

  if (btnJSON) btnJSON.addEventListener("click", async ()=>{
    const payload = scenarioJSON();
    download(`${payload.scenario_name}.json`, JSON.stringify(payload, null, 2));
  });

  if (btnGEO) btnGEO.addEventListener("click", async ()=>{
    // Build GeoJSON using last simulate result (if any), otherwise minimal point
    const payload = scenarioJSON();
    const res = await simulateImpact({
      diameter_m: payload.asteroid.diameter_m,
      density_kg_m3: payload.asteroid.density_kg_m3,
      velocity_km_s: payload.asteroid.velocity_km_s,
      angle_deg: payload.asteroid.angle_deg,
      lat: payload.impact.lat,
      lon: payload.impact.lon,
      target: payload.impact.target
    });
    download(`${payload.scenario_name}.geojson`, JSON.stringify(res.geo, null, 2));
  });
});
