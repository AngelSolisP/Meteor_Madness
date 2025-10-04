import React, { useEffect, useRef, useState } from 'react'
import Scene3D from '../components/Scene3D'
import MapPanel from '../components/MapPanel'
import Metrics from '../components/Metrics'
import ChartsPanel from '../components/ChartsPanel'
import DeflectPanel from '../components/DeflectPanel'
import PresetsBar from '../components/PresetsBar'

type SimInputs = { diameter_m:number; density:number; v_kms:number; angle_deg:number; lat:number; lng:number }

export default function App() {
  const [tab, setTab] = useState<'impact'|'deflect'>('impact')
  const [inputs, setInputs] = useState<SimInputs>({ diameter_m: 200, density: 3000, v_kms: 18, angle_deg: 45, lat: 21.0, lng: -89.0 })
  const [outputs, setOutputs] = useState<any>(null)
  const [ready, setReady] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  useEffect(()=>{
    const w = new Worker(new URL('../workers/physics.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = w
    w.onmessage = (e) => {
      const { type, out } = e.data
      if (type === 'ready') setReady(true)
      if (type === 'result') setOutputs(out)
    }
    w.postMessage({ type: 'init' })
    return () => w.terminate()
  }, [])

  useEffect(()=>{
    if (!ready || !workerRef.current) return
    workerRef.current.postMessage({ type: 'simulate', payload: inputs })
  }, [inputs, ready])

  const onChange = (k:keyof SimInputs, v:number) => setInputs(prev => ({ ...prev, [k]: v }))
  const applyPreset = (p: Partial<SimInputs>) => setInputs(prev => ({ ...prev, ...p }))

  return (
    <div className="layout">
      <header>
        <h1>Meteor Madness — Complete</h1>
        <nav>
          <button className={tab==='impact' ? 'active' : ''} onClick={()=>setTab('impact')}>Impacto</button>
          <button className={tab==='deflect' ? 'active' : ''} onClick={()=>setTab('deflect')}>Deflect</button>
        </nav>
      </header>

      <div className="toolbar">
        <PresetsBar onApply={applyPreset} />
      </div>

      <div className="left">
        <Scene3D impact={{lat: inputs.lat, lng: inputs.lng}} energy_mt={outputs?.energy_mt ?? 0} />
      </div>

      <aside className="right">
        {tab === 'impact' ? (
          <>
            <section className="controls">
              <div className="control"><label>Diámetro (m): {inputs.diameter_m.toFixed(0)}</label>
                <input type="range" min={10} max={10000} step={10} value={inputs.diameter_m} onChange={e=>onChange('diameter_m', Number(e.target.value))}/></div>
              <div className="control"><label>Densidad (kg/m³): {inputs.density.toFixed(0)}</label>
                <input type="range" min={300} max={8000} step={100} value={inputs.density} onChange={e=>onChange('density', Number(e.target.value))}/></div>
              <div className="control"><label>Velocidad (km/s): {inputs.v_kms.toFixed(1)}</label>
                <input type="range" min={5} max={70} step={0.5} value={inputs.v_kms} onChange={e=>onChange('v_kms', Number(e.target.value))}/></div>
              <div className="control"><label>Ángulo (°): {inputs.angle_deg.toFixed(0)}</label>
                <input type="range" min={5} max={90} step={1} value={inputs.angle_deg} onChange={e=>onChange('angle_deg', Number(e.target.value))}/></div>
              <div className="control"><label>Latitud {inputs.lat.toFixed(2)} | Longitud {inputs.lng.toFixed(2)}</label>
                <input type="range" min={-60} max={60} step={0.25} value={inputs.lat} onChange={e=>onChange('lat', Number(e.target.value))}/>
                <input type="range" min={-180} max={180} step={0.25} value={inputs.lng} onChange={e=>onChange('lng', Number(e.target.value))}/></div>
            </section>
            <Metrics outputs={outputs} />
            <section className="section-title">Mapa de impactos y efectos</section>
            <MapPanel heat={outputs?.heat ?? []} impactPoint={{lat: inputs.lat, lng: inputs.lng}} />
            <section className="section-title">Gráficas</section>
            <ChartsPanel outputs={outputs} />
          </>
        ) : (
          <DeflectPanel />
        )}
      </aside>

      <footer><span>NASA/USGS vía backend proxy. Presets y Δv listos.</span><span>© Meteor Madness</span></footer>
    </div>
  )
}