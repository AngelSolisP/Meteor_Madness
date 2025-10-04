import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'

export default function Scene3D({ impact, energy_mt }: { impact: {lat:number,lng:number}, energy_mt:number }) {
  const glow = useMemo(()=> energy_mt > 100 ? '#ff4d3f' : '#ffd166', [energy_mt])
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 55 }} style={{height: '100%'}}>
      <color attach="background" args={['#06070b']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3,2,1]} intensity={1.2} />
      <mesh><sphereGeometry args={[1, 96, 96]} /><meshStandardMaterial color={'#233'} metalness={0.05} roughness={0.9}/></mesh>
      <mesh position={[1.1, 0, 0]}><sphereGeometry args={[0.02, 32, 32]} /><meshBasicMaterial color={glow} /></mesh>
      <Html position={[1.15,0,0]} style={{pointerEvents:'none'}}><div style={{fontSize:12}}>{energy_mt.toFixed(2)} MT</div></Html>
      <OrbitControls />
    </Canvas>
  )
}