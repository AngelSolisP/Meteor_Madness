import React, { useState } from 'react'
export default function DeflectPanel() {
  const [dv, setDv] = useState(0.5)
  const [lead, setLead] = useState(24)
  const moid = Math.max(0, (dv * 1000) * (lead*30*24*3600) / 1e9)
  const safe = moid > 15000
  return (<div className="card">
    <h3>Mitigación — Δv</h3>
    <div className="control"><label>Δv (km/s): {dv.toFixed(2)}</label><input type="range" min={0} max={5} step={0.05} value={dv} onChange={e=>setDv(Number(e.target.value))}/></div>
    <div className="control"><label>Tiempo de antelación (meses): {lead}</label><input type="range" min={1} max={120} step={1} value={lead} onChange={e=>setLead(Number(e.target.value))}/></div>
    <div style={{marginTop:8}}>Desviación aproximada: <b>{moid.toFixed(0)} km</b></div>
    <div style={{marginTop:8}}>{safe ? 'Impacto evitado (MOID > 15,000 km)' : 'Riesgo: MOID insuficiente'}</div>
  </div>)
}