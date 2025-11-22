import { useEffect, useState } from 'react'
import { neoAPI } from '../services/api'
import type { NEOCloseApproach } from '../services/api'
import { Orbit, Calendar, Gauge, AlertTriangle } from 'lucide-react'

const NEOPage = () => {
  const [neos, setNeos] = useState<NEOCloseApproach[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadNEOs()
  }, [maxDistance])

  const loadNEOs = async () => {
    setLoading(true)
    try {
      const res = await neoAPI.getAll({
        limit: 50,
        max_distance_au: maxDistance,
      })
      setNeos(res.data.data)
      setTotal(res.data.total)
    } catch (error) {
      console.error('Error loading NEO data:', error)
    }
    setLoading(false)
  }

  const getDistanceColor = (distanceLD: number) => {
    if (distanceLD < 10) return 'text-red-500'
    if (distanceLD < 30) return 'text-orange-500'
    if (distanceLD < 100) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getSizeCategory = (diameter: number) => {
    if (diameter < 10) return 'Very Small'
    if (diameter < 30) return 'Small'
    if (diameter < 100) return 'Medium'
    if (diameter < 300) return 'Large'
    return 'Very Large'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Orbit className="text-blue-500" />
          Near-Earth Objects
        </h1>
        <p className="text-gray-400 mt-2">
          Close approach data from NASA/JPL Small-Body Database
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              Maximum Distance
            </label>
            <select
              value={maxDistance || 'all'}
              onChange={(e) => setMaxDistance(e.target.value === 'all' ? undefined : Number(e.target.value))}
              className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All distances</option>
              <option value="0.05">Very close (&lt; 0.05 AU)</option>
              <option value="0.1">Close (&lt; 0.1 AU)</option>
              <option value="0.2">Moderate (&lt; 0.2 AU)</option>
              <option value="0.5">Far (&lt; 0.5 AU)</option>
            </select>
          </div>
          
          <div className="ml-auto text-gray-300">
            <span className="text-lg font-semibold text-white">{total}</span> NEO approaches found
          </div>
        </div>
      </div>

      {/* NEO List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-white text-lg">Loading NEO data...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {neos.map((neo) => (
            <div
              key={neo.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold text-xl">
                    {neo.object_name.split('(')[0].trim()}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {neo.object_name.includes('(') && `ID: ${neo.object_name.match(/\((.*?)\)/)?.[1]}`}
                  </p>
                </div>

                {neo.miss_distance_lunar < 30 && (
                  <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm font-medium border border-red-600/30 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    Very Close
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    Approach Date
                  </p>
                  <p className="text-white font-medium">
                    {new Date(neo.approach_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(neo.approach_date).toLocaleTimeString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Miss Distance</p>
                  <p className={`font-bold text-lg ${getDistanceColor(neo.miss_distance_lunar)}`}>
                    {Number(neo.miss_distance_lunar).toFixed(2)} LD
                  </p>
                  <p className="text-gray-400 text-xs">
                    {Number(neo.miss_distance_au).toFixed(4)} AU
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Gauge size={12} />
                    Velocity
                  </p>
                  <p className="text-white font-medium">
                    {Number(neo.relative_velocity_km_s).toFixed(2)} km/s
                  </p>
                  <p className="text-gray-400 text-xs">
                    {(Number(neo.relative_velocity_km_s) * 3600).toFixed(0)} km/h
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Estimated Size</p>
                  <p className="text-white font-medium">
                    ~{Number(neo.estimated_diameter_m).toFixed(0)} m
                  </p>
                  <p className="text-gray-400 text-xs">
                    {getSizeCategory(neo.estimated_diameter_m)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-sm">
                <div className="text-gray-400">
                  Absolute Magnitude: <span className="text-white">{neo.absolute_magnitude}</span>
                </div>
                <div className="text-gray-500">
                  Source: {neo.data_source}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {neos.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">No NEO approaches found matching your criteria</p>
        </div>
      )}

      {/* Reference Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Distance Units Reference</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-gray-300 mb-2">
              <strong className="text-white">Lunar Distance (LD):</strong>
            </p>
            <p className="text-gray-400">
              1 LD = Average Earth-Moon distance (~384,400 km)
            </p>
          </div>
          <div className="bg-gray-700/50 rounded p-3">
            <p className="text-gray-300 mb-2">
              <strong className="text-white">Astronomical Unit (AU):</strong>
            </p>
            <p className="text-gray-400">
              1 AU = Earth-Sun distance (~150 million km)
            </p>
          </div>
        </div>
        <div className="mt-4 bg-blue-900/20 border border-blue-800/30 rounded p-3">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> Objects passing within 30 LD are considered very close approaches and are monitored closely by astronomers.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NEOPage
