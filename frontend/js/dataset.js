export async function loadNEOs() {
  const r = await fetch('data/neos.json');
  if (!r.ok) throw new Error('No se pudo cargar data/neos.json');
  return await r.json();
}

export function fillSelect(selectEl, neos){
  selectEl.innerHTML = '';
  neos.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n.id;
    opt.textContent = `${n.name} — ${n.orbit_class}${n.is_hazardous ? ' ⚠️' : ''}`;
    selectEl.appendChild(opt);
  });
}

export function describeNEO(n){
  const haz = n.is_hazardous ? 'Sí' : 'No';
  const v = n.physical_params?.velocity_kms?.toFixed(2);
  const d = n.physical_params?.diameter_avg_m?.toFixed(1);
  const date = n.approach_date || '—';
  return `Peligroso: ${haz} | v=${v} km/s | D≈${d} m | Acercamiento: ${date}`;
}
