/**
 * Orbital Elements Page - Display orbital parameters for celestial objects
 * 
 * Shows orbital mechanics data for planets and interstellar objects
 * including semi-major axis, eccentricity, inclination, and orbital period.
 */

import { useState, useEffect } from 'react'
import { Orbit, Loader2, AlertCircle, Rocket, Star } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phobetronwebapp-production.up.railway.app'

interface OrbitalElement {
  id: string
  object_name: string
  semi_major_axis_au: number
  eccentricity: number
  inclination_deg: number
  longitude_ascending_node_deg: number | null
  argument_perihelion_deg: number | null
  mean_anomaly_deg: number | null
  epoch_iso: string
  data_source: string
  is_interstellar: boolean
  created_at: string
}

interface ApiResponse {
  total: number
  skip: number
  limit: number
  data: OrbitalElement[]
}

const OrbitalElementsPage = () => {
  const [elements, setElements] = useState<OrbitalElement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterInterstellar, setFilterInterstellar] = useState<string>('all')

  useEffect(() => {
    fetchOrbitalElements()
  }, [])

  const fetchOrbitalElements = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/v1/scientific/orbital-elements?limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      setElements(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orbital elements')
      console.error('Error fetching orbital elements:', err)
    } finally {
      setLoading(false)
    }
  }

  const isInterstellar = (e: number): boolean => e >= 1.0

  const getOrbitType = (e: number): string => {
    if (e < 1.0) return 'Bound Orbit'
    if (e === 1.0) return 'Parabolic'
    return 'Hyperbolic (Interstellar)'
  }

  const getOrbitTypeColor = (e: number): string => {
    if (e < 1.0) return 'bg-green-500/20 text-green-300 border-green-500/50'
    if (e === 1.0) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
    return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
  }

  const filteredElements = filterInterstellar === 'all'
    ? elements
    : filterInterstellar === 'interstellar'
    ? elements.filter(e => isInterstellar(e.eccentricity))
    : elements.filter(e => !isInterstellar(e.eccentricity))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading orbital elements...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchOrbitalElements}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Orbit className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Orbital Elements</h1>
        </div>
        <p className="text-gray-300">
          Keplerian orbital parameters for celestial objects including planets and interstellar visitors.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-gray-400">Total Objects</div>
            <div className="text-2xl font-bold text-white">{elements.length}</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-gray-400">Bound Orbits</div>
            <div className="text-2xl font-bold text-white">
              {elements.filter(e => !isInterstellar(e.eccentricity)).length}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-gray-400">Interstellar</div>
            <div className="text-2xl font-bold text-white">
              {elements.filter(e => isInterstellar(e.eccentricity)).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Filter by Orbit Type</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterInterstellar('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              filterInterstellar === 'all'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
            }`}
          >
            All Objects
          </button>
          <button
            onClick={() => setFilterInterstellar('bound')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              filterInterstellar === 'bound'
                ? 'bg-green-600 text-white border-green-500'
                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
            }`}
          >
            Bound Orbits (e &lt; 1.0)
          </button>
          <button
            onClick={() => setFilterInterstellar('interstellar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              filterInterstellar === 'interstellar'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
            }`}
          >
            Interstellar (e ≥ 1.0)
          </button>
        </div>
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredElements.map(element => (
          <div
            key={element.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{element.object_name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getOrbitTypeColor(element.eccentricity)}`}>
                  {getOrbitType(element.eccentricity)}
                </span>
              </div>
              {isInterstellar(element.eccentricity) ? (
                <Star className="w-6 h-6 text-purple-400 flex-shrink-0" />
              ) : (
                <Orbit className="w-6 h-6 text-blue-400 flex-shrink-0" />
              )}
            </div>

            {/* Orbital Parameters */}
            <div className="space-y-2">
              <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Semi-major Axis (a)</span>
                    <p className="text-white font-semibold">{element.semi_major_axis_au.toFixed(3)} AU</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Eccentricity (e)</span>
                    <p className="text-white font-semibold">{element.eccentricity.toFixed(3)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Inclination (i)</span>
                    <p className="text-white font-semibold">{element.inclination_deg.toFixed(2)}°</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Interstellar</span>
                    <p className="text-white font-semibold">{element.is_interstellar ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              {(element.longitude_ascending_node_deg !== null || element.argument_perihelion_deg !== null) && (
                <div className="bg-gray-900/50 rounded p-3 border border-gray-700/50">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Advanced Parameters</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {element.longitude_ascending_node_deg !== null && (
                      <div>
                        <span className="text-gray-400">Longitude Ω</span>
                        <p className="text-white font-semibold">{element.longitude_ascending_node_deg.toFixed(2)}°</p>
                      </div>
                    )}
                    {element.argument_perihelion_deg !== null && (
                      <div>
                        <span className="text-gray-400">Argument ω</span>
                        <p className="text-white font-semibold">{element.argument_perihelion_deg.toFixed(2)}°</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
              <span>Source: {element.data_source}</span>
              <span>Epoch: {new Date(element.epoch_iso).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredElements.length === 0 && (
        <div className="text-center py-12">
          <Orbit className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No orbital elements found for this filter.</p>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">About Orbital Elements</h3>
        <div className="text-xs text-gray-300 space-y-1">
          <p>• <strong>Semi-major Axis (a):</strong> Half the longest diameter of the orbit (in AU)</p>
          <p>• <strong>Eccentricity (e):</strong> Shape of orbit. 0 = circle, &lt;1 = ellipse, ≥1 = hyperbolic/parabolic</p>
          <p>• <strong>Inclination (i):</strong> Tilt of orbit relative to reference plane (in degrees)</p>
          <p>• <strong>Interstellar Objects:</strong> Hyperbolic orbits (e ≥ 1.0) indicate objects from outside our solar system</p>
        </div>
      </div>
    </div>
  )
}

export default OrbitalElementsPage
