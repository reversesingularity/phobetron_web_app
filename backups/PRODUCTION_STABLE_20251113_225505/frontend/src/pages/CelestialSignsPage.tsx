/**
 * Celestial Signs Page - Display theological signs from biblical prophecy
 * 
 * Shows celestial signs that can be correlated with astronomical/geophysical events
 * including scripture references and theological significance.
 */

import { useState, useEffect } from 'react'
import { Star, Loader2, AlertCircle, BookOpen, Sparkles } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phobetronwebapp-production.up.railway.app'

interface CelestialSign {
  id: number
  sign_name: string
  sign_type: string
  sign_description: string
  scripture_reference: string
  theological_interpretation: string
  created_at: string
}

interface ApiResponse {
  total: number
  skip: number
  limit: number
  data: CelestialSign[]
}

const CelestialSignsPage = () => {
  const [signs, setSigns] = useState<CelestialSign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchCelestialSigns()
  }, [])

  const fetchCelestialSigns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/v1/theological/celestial-signs?limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      setSigns(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch celestial signs')
      console.error('Error fetching celestial signs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSignTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'SOLAR': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'LUNAR': 'bg-blue-400/20 text-blue-300 border-blue-400/50',
      'STELLAR': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'COSMIC': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
      'SEISMIC': 'bg-red-500/20 text-red-300 border-red-500/50',
      'TERRESTRIAL': 'bg-green-500/20 text-green-300 border-green-500/50',
      'ATMOSPHERIC': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      'COMBINED': 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    }
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/50'
  }

  const uniqueTypes = ['all', ...Array.from(new Set(signs.map(s => s.sign_type)))]

  const filteredSigns = filterType === 'all' 
    ? signs 
    : signs.filter(s => s.sign_type === filterType)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading celestial signs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Signs</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchCelestialSigns}
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
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Star className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Celestial Signs</h1>
        </div>
        <p className="text-gray-300">
          Biblical prophecies of celestial and terrestrial signs correlating with astronomical and geophysical events.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-gray-400">Total Signs</div>
            <div className="text-2xl font-bold text-white">{signs.length}</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-gray-400">Sign Types</div>
            <div className="text-2xl font-bold text-white">{uniqueTypes.length - 1}</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-gray-400">Filtered</div>
            <div className="text-2xl font-bold text-white">{filteredSigns.length}</div>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Filter by Type</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                filterType === type
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Signs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSigns.map(sign => (
          <div
            key={sign.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{sign.sign_name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSignTypeColor(sign.sign_type)}`}>
                  {sign.sign_type}
                </span>
              </div>
              <Star className="w-6 h-6 text-purple-400 flex-shrink-0" />
            </div>

            {/* Scripture Reference */}
            <div className="bg-gray-900/50 rounded-lg p-3 mb-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Scripture Reference</span>
              </div>
              <p className="text-gray-300 text-sm">{sign.scripture_reference}</p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{sign.sign_description}</p>
              </div>

              {/* Theological Interpretation */}
              {sign.theological_interpretation && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Theological Significance</h4>
                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    {sign.theological_interpretation}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                Added: {new Date(sign.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSigns.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No celestial signs found for this filter.</p>
        </div>
      )}
    </div>
  )
}

export default CelestialSignsPage
