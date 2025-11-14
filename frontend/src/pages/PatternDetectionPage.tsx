import { useEffect, useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle, Sun, Moon, Activity } from 'lucide-react'

interface PatternEvent {
  date: string
  type: string
  name: string
  magnitude?: number
  significance: number
}

interface PatternCorrelation {
  feast_day: string
  feast_date: string
  celestial_event?: string
  natural_events: string[]
  correlation_score: number
  time_proximity_days: number
}

interface PatternData {
  start_date: string
  end_date: string
  total_patterns: number
  events: {
    feast_days: PatternEvent[]
    eclipses: PatternEvent[]
    earthquakes: PatternEvent[]
    volcanic: PatternEvent[]
    hurricanes: PatternEvent[]
    tsunamis: PatternEvent[]
    neos: PatternEvent[]
  }
  correlations: PatternCorrelation[]
  statistics: {
    high_correlation_count: number
    average_correlation: number
    most_active_month: string
  }
}

export default function PatternDetectionPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patternData, setPatternData] = useState<PatternData | null>(null)
  const [startYear, setStartYear] = useState(2024)
  const [endYear, setEndYear] = useState(2025)
  const [minCorrelation, setMinCorrelation] = useState(0.5)

  useEffect(() => {
    fetchPatterns()
  }, [])

  const fetchPatterns = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8020'
      const response = await fetch(
        `${apiUrl}/api/v1/ml/comprehensive-pattern-detection?start_year=${startYear}&end_year=${endYear}&min_correlation=${minCorrelation}`
      )
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setPatternData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pattern data')
      console.error('Error fetching patterns:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'feast': return <Calendar className="w-4 h-4" />
      case 'eclipse': return <Moon className="w-4 h-4" />
      case 'earthquake': return <Activity className="w-4 h-4" />
      case 'volcanic': return <AlertTriangle className="w-4 h-4" />
      case 'hurricane': return <TrendingUp className="w-4 h-4" />
      case 'tsunami': return <Activity className="w-4 h-4" />
      case 'neo': return <Sun className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getCorrelationColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-500'
    if (score >= 0.6) return 'bg-orange-500'
    if (score >= 0.4) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Analyzing patterns across events...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-red-400">Error Loading Patterns</h3>
            </div>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchPatterns}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            Pattern Detection Dashboard
          </h1>
          <p className="text-gray-400">
            Analyzing correlations between biblical feast days, celestial events, and natural disasters
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Year
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Year
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2020"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Correlation
              </label>
              <input
                type="number"
                value={minCorrelation}
                onChange={(e) => setMinCorrelation(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPatterns}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
              >
                Analyze Patterns
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {patternData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-lg p-6 border border-blue-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-300">Total Patterns</h3>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{patternData.total_patterns}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {patternData.start_date} to {patternData.end_date}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg p-6 border border-purple-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-300">High Correlations</h3>
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {patternData.statistics?.high_correlation_count || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Score ≥ 0.7</p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 rounded-lg p-6 border border-orange-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-orange-300">Avg Correlation</h3>
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {patternData.statistics?.average_correlation?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Across all events</p>
              </div>
            </div>

            {/* Event Timeline Overview */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                Event Timeline Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {/* Feast Days Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-blue-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-blue-300">Feast Days</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.feast_days?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Biblical Feasts</p>
                </div>

                {/* Eclipses Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-purple-300">Eclipses</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.eclipses?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Solar & Lunar</p>
                </div>

                {/* Earthquakes Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-red-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-red-300">Earthquakes</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.earthquakes?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Seismic Events</p>
                </div>

                {/* Volcanic Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-orange-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-orange-300">Volcanic</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.volcanic?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Eruptions</p>
                </div>

                {/* Hurricanes Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-cyan-300">Hurricanes</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.hurricanes?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Tropical Storms</p>
                </div>

                {/* Tsunamis Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-teal-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-teal-400" />
                    <h3 className="font-semibold text-teal-300">Tsunamis</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.tsunamis?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Ocean Waves</p>
                </div>

                {/* NEOs Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-yellow-300">NEOs</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.events?.neos?.length || 0}
                  </p>
                  <p className="text-xs text-gray-400">Close Approaches</p>
                </div>
              </div>
            </div>

            {/* Correlations Table */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Detected Correlations
              </h2>

              {patternData.correlations && patternData.correlations.length > 0 ? (
                <div className="space-y-4">
                  {patternData.correlations.map((correlation, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-lg text-white">
                              {correlation.feast_day}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {new Date(correlation.feast_date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {correlation.celestial_event && (
                            <div className="flex items-center gap-2 mb-2 text-sm text-purple-300">
                              <Moon className="w-4 h-4" />
                              <span>{correlation.celestial_event}</span>
                            </div>
                          )}

                          {correlation.natural_events && correlation.natural_events.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {correlation.natural_events.map((event, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs border border-red-700/50"
                                >
                                  {event}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">Correlation</span>
                            <div
                              className={`w-16 h-2 rounded-full ${getCorrelationColor(
                                correlation.correlation_score
                              )}`}
                            />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {(correlation.correlation_score * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ±{correlation.time_proximity_days} days
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    No significant correlations found in this date range.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting the year range or lowering the minimum correlation threshold.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
