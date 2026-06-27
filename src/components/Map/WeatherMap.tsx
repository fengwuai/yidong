import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface SimpleMapProps {
  center: [number, number]
  zoom?: number
  onLocationSelect?: (lat: number, lon: number) => void
  markerPosition?: [number, number] | null
}

function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (lat >= 17 && lat <= 55 && lng >= 72 && lng <= 137) {
        onLocationSelect(lat, lng)
      }
    },
  })
  return null
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 })
  }, [center, zoom, map])
  return null
}

export function SimpleWeatherMap({ center, zoom = 5, onLocationSelect, markerPosition }: SimpleMapProps) {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center as LatLngExpression}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FlyTo center={center} zoom={zoom} />
        {onLocationSelect && <LocationPicker onLocationSelect={onLocationSelect} />}
        {markerPosition && (
          <Marker position={markerPosition as LatLngExpression}>
            <Popup>
              <div className="text-xs">
                <div>经度: {markerPosition[1].toFixed(4)}°E</div>
                <div>纬度: {markerPosition[0].toFixed(4)}°N</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

interface TemplateMapProps {
  mode: 'rectangle' | 'coordinates' | 'region'
  rectangle?: { minLon: number; maxLon: number; minLat: number; maxLat: number }
  coordinates?: Array<{ lon: number; lat: number }>
  onRectangleChange?: (rect: { minLon: number; maxLon: number; minLat: number; maxLat: number }) => void
}

function RectangleDraw({ onRectangleChange }: { onRectangleChange: (r: any) => void }) {
  const startRef = useRef<[number, number] | null>(null)
  useMapEvents({
    mousedown(e) {
      startRef.current = [e.latlng.lat, e.latlng.lng]
    },
    mouseup(e) {
      if (startRef.current) {
        const [startLat, startLng] = startRef.current
        const endLat = e.latlng.lat
        const endLng = e.latlng.lng
        onRectangleChange({
          minLon: Math.min(startLng, endLng),
          maxLon: Math.max(startLng, endLng),
          minLat: Math.min(startLat, endLat),
          maxLat: Math.max(startLat, endLat),
        })
        startRef.current = null
      }
    },
  })
  return null
}

export function TemplateMap({ mode, rectangle, coordinates, onRectangleChange }: TemplateMapProps) {
  const defaultCenter: [number, number] = [35.5, 103.5]

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter as LatLngExpression}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {mode === 'rectangle' && onRectangleChange && (
          <RectangleDraw onRectangleChange={onRectangleChange} />
        )}
        {mode === 'rectangle' && rectangle && (
          <Rectangle
            bounds={[
              [rectangle.minLat, rectangle.minLon],
              [rectangle.maxLat, rectangle.maxLon],
            ]}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 2 }}
          />
        )}
        {mode === 'coordinates' && coordinates?.map((coord, i) => (
          <Marker key={i} position={[coord.lat, coord.lon] as LatLngExpression}>
            <Popup>
              <div className="text-xs">
                <div>坐标 #{i + 1}</div>
                <div>{coord.lon.toFixed(4)}°E, {coord.lat.toFixed(4)}°N</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
