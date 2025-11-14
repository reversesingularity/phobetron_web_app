import { useEffect, useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle, Sun, Moon, Activity } from 'lucide-react'

interface PatternEvent {
  date: string
  type: string
  name: string
  magnitude?: number
  significance: number
}

interface CorrelatedEvent {
  type: string
  date: string
  magnitude?: number
  name?: string
  vei?: number
  category?: number
  cause?: string
  wave_height?: number
  location?: string
  days_from_feast: number
}

interface Pattern {
  feast_day: string
  feast_date: string
  feast_type: string
  events: CorrelatedEvent[]
  event_count: number
  correlation_score: number
  significance: string
}

interface PatternData {
  success: boolean
  patterns: Pattern[]
  statistics: {
    total_patterns: number
    high_correlation_count: number
    average_correlation: number
    total_events_analyzed: number
    feast_days_in_range: number
  }
  event_counts: {
    earthquakes: number
    volcanic: number
    hurricanes: number
    tsunamis: number
  }
  metadata: {
    date_range: {
      start: string
      end: string
    }
    analysis_method: string
    window_days: number
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
      
      // Convert years to date range (YYYY-MM-DD format)
      const startDate = `${startYear}-01-01`
      const endDate = `${endYear}-12-31`
      
      const response = await fetch(
        `${apiUrl}/api/v1/ml/comprehensive-pattern-detection?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      const data = await response.json()
      
      // Check if API returned an error response (even with 200 status)
      if (!data.success && data.error) {
        if (data.error === 'feast_days_table_missing') {
          setError('⚠️ Database setup incomplete: Feast days not yet populated. Please contact administrator to run the data population script.')
        } else {
          setError(data.message || 'Pattern detection encountered an error')
        }
        setPatternData(data) // Set data anyway to show empty state
        return
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
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
                <p className="text-3xl font-bold text-white">{patternData.statistics.total_patterns}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {patternData.statistics.feast_days_in_range} feast days analyzed
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg p-6 border border-purple-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-purple-300">High Correlations</h3>
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {patternData.statistics.high_correlation_count}
                </p>
                <p className="text-sm text-gray-400 mt-1">Score ≥ 70</p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 rounded-lg p-6 border border-orange-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-orange-300">Avg Correlation</h3>
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {patternData.statistics.average_correlation.toFixed(1)}
                </p>
                <p className="text-sm text-gray-400 mt-1">Across all patterns</p>
              </div>
            </div>

            {/* Event Timeline Overview */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                Event Counts
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Earthquakes Column */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-red-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-red-300">Earthquakes</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {patternData.event_counts.earthquakes}
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
                    {patternData.event_counts.volcanic}
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
                    {patternData.event_counts.hurricanes}
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
                    {patternData.event_counts.tsunamis}
                  </p>
                  <p className="text-xs text-gray-400">Ocean Waves</p>
                </div>
              </div>
            </div>

            {/* Correlations Table */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Detected Patterns (±{patternData.metadata.window_days} days)
              </h2>

              {patternData.patterns && patternData.patterns.length > 0 ? (
                <div className="space-y-4">
                  {patternData.patterns.map((pattern, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-lg text-white">
                              {pattern.feast_day}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {new Date(pattern.feast_date).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs border border-blue-700/50">
                              {pattern.feast_type}
                            </span>
                          </div>
                          
                          {pattern.events && pattern.events.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {pattern.events.map((event, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 text-sm bg-gray-800/50 rounded px-3 py-2 border border-gray-700/30"
                                >
                                  {getEventIcon(event.type)}
                                  <span className="capitalize text-gray-300">{event.type}</span>
                                  {event.name && <span className="text-white font-medium">{event.name}</span>}
                                  {event.location && <span className="text-gray-400">{event.location}</span>}
                                  {event.magnitude && (
                                    <span className="text-orange-400">M{event.magnitude.toFixed(1)}</span>
                                  )}
                                  {event.vei && (
                                    <span className="text-red-400">VEI {event.vei}</span>
                                  )}
                                  {event.category && (
                                    <span className="text-cyan-400">Cat {event.category}</span>
                                  )}
                                  <span className={`ml-auto text-xs ${Math.abs(event.days_from_feast) <= 3 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {event.days_from_feast > 0 ? '+' : ''}{event.days_from_feast} days
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">Correlation</span>
                            <div
                              className={`w-16 h-2 rounded-full ${
                                pattern.correlation_score >= 80 ? 'bg-red-500' :
                                pattern.correlation_score >= 60 ? 'bg-orange-500' :
                                pattern.correlation_score >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                            />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {pattern.correlation_score}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {pattern.event_count} events
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
                    Try adjusting the year range to include more feast days and events.
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
