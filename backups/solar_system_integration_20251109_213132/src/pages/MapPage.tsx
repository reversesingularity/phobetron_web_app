import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import { Icon } from 'leaflet'
import { earthquakesAPI, volcanicAPI } from '../services/api'
import type { Earthquake, VolcanicActivity } from '../services/api'
import 'leaflet/dist/leaflet.css'

const MapPage = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [volcanic, setVolcanic] = useState<VolcanicActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showEarthquakes, setShowEarthquakes] = useState(true)
  const [showVolcanic, setShowVolcanic] = useState(true)

  useEffect(() => {
    loadMapData()
  }, [])

  const loadMapData = async () => {
    try {
      const [eqRes, volRes] = await Promise.all([
        earthquakesAPI.getAll({ limit: 100 }),
        volcanicAPI.getAll({ limit: 100 }),
      ])

      setEarthquakes(eqRes.data.data)
      setVolcanic(volRes.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading map data:', error)
      setLoading(false)
    }
  }

  const getEarthquakeColor = (magnitude: number) => {
    if (magnitude >= 6.0) return '#dc2626' // red-600
    if (magnitude >= 5.5) return '#ea580c' // orange-600
    if (magnitude >= 5.0) return '#f59e0b' // amber-500
    return '#84cc16' // lime-500
  }

  const getEarthquakeRadius = (magnitude: number) => {
    return Math.max(4, (magnitude - 4) * 3)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Loading map data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Global Events Map</h1>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={showEarthquakes}
              onChange={(e) => setShowEarthquakes(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              Earthquakes ({earthquakes.length})
            </span>
          </label>
          
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={showVolcanic}
              onChange={(e) => setShowVolcanic(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-600"></span>
              Volcanoes ({volcanic.length})
            </span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700" style={{ height: 'calc(100vh - 250px)' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Earthquakes */}
          {showEarthquakes && earthquakes.map((eq) => (
            <CircleMarker
              key={eq.id}
              center={[eq.latitude, eq.longitude]}
              radius={getEarthquakeRadius(eq.magnitude)}
              fillColor={getEarthquakeColor(eq.magnitude)}
              color="#fff"
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">M{eq.magnitude} Earthquake</h3>
                  <p className="text-sm text-gray-600 mt-1">{eq.region}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Depth:</strong> {eq.depth_km.toFixed(1)} km</p>
                    <p><strong>Time:</strong> {new Date(eq.event_time).toLocaleString()}</p>
                    <p><strong>Type:</strong> {eq.magnitude_type.toUpperCase()}</p>
                    <p><strong>Source:</strong> {eq.data_source}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Volcanic Activity */}
          {showVolcanic && volcanic.map((vol) => (
            <CircleMarker
              key={vol.id}
              center={[vol.latitude, vol.longitude]}
              radius={8}
              fillColor="#ea580c"
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">{vol.volcano_name}</h3>
                  <p className="text-sm text-gray-600">{vol.country}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>VEI:</strong> {vol.vei}</p>
                    <p><strong>Type:</strong> {vol.eruption_type}</p>
                    <p><strong>Plume:</strong> {vol.plume_height_km} km</p>
                    <p><strong>Started:</strong> {new Date(vol.eruption_start).toLocaleDateString()}</p>
                    {vol.eruption_end ? (
                      <p><strong>Ended:</strong> {new Date(vol.eruption_end).toLocaleDateString()}</p>
                    ) : (
                      <p className="text-orange-600 font-semibold">Ongoing</p>
                    )}
                    <p className="text-gray-600 italic mt-2">{vol.notes}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-3">Earthquake Magnitude Scale</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#84cc16' }}></div>
            <span className="text-gray-300 text-sm">M4.0 - 5.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-gray-300 text-sm">M5.0 - 5.5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
            <span className="text-gray-300 text-sm">M5.5 - 6.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-gray-300 text-sm">M6.0+</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapPage
