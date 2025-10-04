import React, { useMemo } from 'react'
import { DeckGL } from '@deck.gl/react'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { ScatterplotLayer } from '@deck.gl/layers'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapPanel({ heat, impactPoint }: { heat:any[], impactPoint: {lat:number,lng:number} }) {
  const layers = useMemo(() => {
    const heatLayer = new HeatmapLayer({
      id: 'damage-heat',
      data: heat,
      getPosition: (d:any) => [d.lng, d.lat],
      getWeight: (d:any) => d.weight ?? 1,
      radiusPixels: 50
    })

    const dot = new ScatterplotLayer({
      id: 'impact',
      data: [impactPoint],
      getPosition: (d:any) => [d.lng, d.lat],
      getRadius: 15000,
      radiusMinPixels: 4,
      filled: true
    })

    return [heatLayer, dot]
  }, [heat, impactPoint])

  const initial = { longitude: impactPoint.lng, latitude: impactPoint.lat, zoom: 4, bearing: 0, pitch: 0 }

  return (
    <div className="map-wrap">
      <DeckGL controller initialViewState={initial as any} layers={layers} width="100%" height="100%">
        <Map reuseMaps mapStyle="https://demotiles.maplibre.org/style.json" />
      </DeckGL>
    </div>
  )
}
