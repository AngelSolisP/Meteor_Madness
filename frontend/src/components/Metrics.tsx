import React from 'react'
export default function Metrics({ outputs }: { outputs: any }) {
  return (<>
    <section className="section-title">Métricas</section>
    <div className="cards">
      <div className="card"><div style={{fontSize:12, color:'#9aa4b2'}}>Energía estimada</div><div style={{fontSize:20, fontWeight:700}}>{outputs ? outputs.energy_mt.toFixed(2) : '…'} MT TNT</div></div>
      <div className="card"><div style={{fontSize:12, color:'#9aa4b2'}}>Diámetro cráter</div><div style={{fontSize:20, fontWeight:700}}>{outputs ? outputs.crater_km.toFixed(2) : '…'} km</div></div>
      <div className="card"><div style={{fontSize:12, color:'#9aa4b2'}}>Radio sísmico (est.)</div><div style={{fontSize:20, fontWeight:700}}>{outputs ? outputs.seismic_km.toFixed(0) : '…'} km</div></div>
    </div>
  </>)
}