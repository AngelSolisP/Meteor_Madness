import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
export default function ChartsPanel({ outputs }: { outputs:any }) {
  const data = (outputs?.profile ?? []).slice(0, 50)
  return (<div className="card" style={{height:240}}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}><XAxis dataKey="d" tick={{fill:'#9aa4b2'}}/><YAxis tick={{fill:'#9aa4b2'}}/><Tooltip /><Line type="monotone" dataKey="ejecta" dot={false} /></LineChart>
    </ResponsiveContainer>
  </div>)
}