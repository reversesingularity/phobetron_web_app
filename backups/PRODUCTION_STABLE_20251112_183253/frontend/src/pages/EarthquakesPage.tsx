import { useEffect, useState } from 'react'
import { earthquakesAPI } from '../services/api'
import type { Earthquake } from '../services/api'
import { Activity, MapPin, Gauge } from 'lucide-react'

const EarthquakesPage = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [minMagnitude, setMinMagnitude] = useState(5.0)

  useEffect(() => {
    loadEarthquakes()
  }, [minMagnitude])

  const loadEarthquakes = async () => {
    setLoading(true)
    try {
      const res = await earthquakesAPI.getAll({
        limit: 50,
        min_magnitude: minMagnitude,
      })
      setEarthquakes(res.data.data)
      setTotal(res.data.total)
    } catch (error) {
      console.error('Error loading earthquakes:', error)
    }
    setLoading(false)
  }

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 6.0) return 'text-red-500'
    if (magnitude >= 5.5) return 'text-orange-500'
    if (magnitude >= 5.0) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Activity className="text-red-500" />
          Earthquakes
        </h1>
        <p className="text-gray-400 mt-2">
          Real-time earthquake data from USGS
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Minimum Magnitude
            </label>
            <select
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(Number(e.target.value))}
              className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="4.0">M4.0+</option>
              <option value="4.5">M4.5+</option>
              <option value="5.0">M5.0+</option>
              <option value="5.5">M5.5+</option>
              <option value="6.0">M6.0+</option>
            </select>
          </div>
          
          <div className="ml-auto text-gray-300">
            <span className="text-lg font-semibold text-white">{total}</span> earthquakes found
          </div>
        </div>
      </div>

      {/* Earthquakes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-white text-lg">Loading earthquakes...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {earthquakes.map((eq) => (
            <div
              key={eq.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-3xl font-bold ${getMagnitudeColor(eq.magnitude)}`}>
                      M{eq.magnitude.toFixed(1)}
                    </span>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{eq.region}</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(eq.event_time).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Gauge size={16} className="text-gray-400" />
                      <span className="text-sm">
                        <span className="text-gray-400">Depth:</span> {eq.depth_km.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm">
                        <span className="text-gray-400">Lat:</span> {eq.latitude.toFixed(3)}°
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm">
                        <span className="text-gray-400">Lon:</span> {eq.longitude.toFixed(3)}°
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      <span className="text-gray-400">Type:</span> {eq.magnitude_type.toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Event ID: {eq.event_id} • Source: {eq.data_source}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {earthquakes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">No earthquakes found matching your criteria</p>
        </div>
      )}
    </div>
  )
}

export default EarthquakesPage
