import React from 'react'
import presets from '../services/presets.json'
export default function PresetsBar({ onApply }:{ onApply: (p:any)=>void }) {
  return (<>
    <button onClick={()=>onApply(presets.chelyabinsk)}>Chelyabinsk</button>
    <button onClick={()=>onApply(presets.tunguska)}>Tunguska</button>
    <button onClick={()=>onApply(presets.chicxulub)}>Chicxulub</button>
  </>)
}