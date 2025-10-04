export const API_BASE = "http://127.0.0.1:5001";

export async function simulateImpact(payload) {
  const r = await fetch(`${API_BASE}/api/simulate-impact`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Simulate impact failed");
  return await r.json();
}

export async function neowsBrowse(page=0, size=10) {
  const r = await fetch(`${API_BASE}/api/neows/browse?page=${page}&size=${size}`);
  if (!r.ok) throw new Error("NeoWs browse failed");
  return await r.json();
}

export async function elevation(lat, lon) {
  const r = await fetch(`${API_BASE}/api/elevation?lat=${lat}&lon=${lon}`);
  if (!r.ok) throw new Error("Elevation failed");
  return await r.json();
}

export async function sbdbQuery(params){
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API_BASE}/api/sbdb?${qs}`);
  if (!r.ok) throw new Error("SBDB query failed");
  return await r.json();
}
export async function neowsGetById(id){
  const r = await fetch(`${API_BASE}/api/neows/neo?id=${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error("NeoWs by id failed");
  return await r.json();
}
