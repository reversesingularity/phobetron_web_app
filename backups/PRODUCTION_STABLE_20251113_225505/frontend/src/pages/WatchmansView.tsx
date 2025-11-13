/**
 * Watchman's View - Prophetic Correlation Dashboard
 * 
 * Correlates celestial phenomena and natural disasters with biblical prophecies
 * Features:
 * - Hebrew Feast correlation
 * - AI significance predictions
 * - Seismos correlation (celestial + earthquake patterns)
 * - Real-time alerts for prophetic signatures
 * - Theological framework: Literal premillennial eschatology
 */

import { useState, useEffect } from 'react'
import { Calendar, AlertTriangle, Star, Activity, TrendingUp, Sparkles } from 'lucide-react'
import { mlClient } from '../lib/api/mlClient'
import { getFeastsInRange, formatFeastDateRange } from '../lib/utils/hebrewCalendar'
import { 
  filterEventsWithFeastCorrelations, 
  getCorrelationStats,
  getMostSignificantCorrelation 
} from '../lib/utils/feastCorrelation'
import type { 
  CelestialEvent, 
  EarthEvent, 
  FeastCorrelation, 
  HebrewFeast,
  EventPrediction,
  Alert as PropheticAlert
} from '../lib/types/celestial'
import { earthquakesAPI } from '../services/api'

const WatchmansView = () => {
  const [celestialEvents, setCelestialEvents] = useState<CelestialEvent[]>([])
  const [earthEvents, setEarthEvents] = useState<EarthEvent[]>([])
  const [feastCorrelations, setFeastCorrelations] = useState<FeastCorrelation[]>([])
  const [predictions, setPredictions] = useState<Map<string, EventPrediction>>(new Map())
  const [hebrewFeasts, setHebrewFeasts] = useState<HebrewFeast[]>([])
  const [mlAlerts, setMlAlerts] = useState<PropheticAlert[]>([])
  const [filterByFeast, setFilterByFeast] = useState(false)

  const dateRange = {
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), 11, 31),
  }

  useEffect(() => {
    loadAllData()
  }, [dateRange])

  const loadAllData = async () => {
    try {
      // Load Hebrew feasts for the year
      const feasts = getFeastsInRange(dateRange.start, dateRange.end)
      setHebrewFeasts(feasts)

      // Load ML-powered Watchman alerts from backend
      const alerts = await mlClient.getWatchmanAlerts(
        undefined, // event_type filter
        70,        // min_severity
        0.7        // min_significance
      )
      setMlAlerts(alerts)

      // Load celestial events (mock data for now - replace with API)
      const mockCelestialEvents = generateMockCelestialEvents()
      setCelestialEvents(mockCelestialEvents)

      // Load earthquake data from API
      const eqResponse = await earthquakesAPI.getAll({ 
        limit: 100,
        min_magnitude: 5.0 
      })
      
      const earthquakeEvents: EarthEvent[] = eqResponse.data.data.map(eq => ({
        id: eq.id,
        type: 'earthquake' as const,
        date: new Date(eq.event_time),
        location: eq.region,
        coordinates: {
          latitude: eq.latitude,
          longitude: eq.longitude,
        },
        magnitude: eq.magnitude,
        severity: eq.magnitude >= 7.5 ? 'critical' : eq.magnitude >= 6.5 ? 'high' : eq.magnitude >= 5.5 ? 'medium' : 'low',
        description: `M${eq.magnitude} earthquake near ${eq.region}`,
        propheticSignificance: eq.magnitude >= 7.0 ? 'high' : eq.magnitude >= 6.0 ? 'medium' : 'low',
      }))
      
      setEarthEvents(earthquakeEvents)

      // Calculate feast correlations
      const allEvents = [...mockCelestialEvents, ...earthquakeEvents]
      const correlations = filterEventsWithFeastCorrelations(allEvents, 3, 50)
      setFeastCorrelations(correlations)

      // Generate AI predictions using backend LSTM model
      const predictionMap = new Map<string, EventPrediction>()
      for (const event of mockCelestialEvents) {
        try {
          // Use backend TensorFlow LSTM for predictions
          const prediction = await mlClient.getPropheticPrediction([event])
          predictionMap.set(event.id, prediction)
        } catch (error) {
          console.error(`Prediction failed for ${event.id}:`, error)
        }
      }
      setPredictions(predictionMap)

    } catch (error) {
      console.error('Error loading watchman data:', error)
    }
  }

  // Generate mock celestial events (replace with real API later)
  const generateMockCelestialEvents = (): CelestialEvent[] => {
    return [
      {
        id: 'blood-moon-2025-03-14',
        type: 'blood_moon',
        date: new Date('2025-03-14'),
        name: 'Total Lunar Eclipse (Blood Moon)',
        description: 'Total lunar eclipse visible from Jerusalem and Middle East',
        magnitude: 1.0,
        duration: 85,
        visibility: { jerusalem: true, global: false, regions: ['Middle East', 'Europe', 'Africa'] },
        propheticSignificance: 'high',
      },
      {
        id: 'solar-eclipse-2025-09-21',
        type: 'solar_eclipse',
        date: new Date('2025-09-21'),
        name: 'Partial Solar Eclipse',
        description: 'Partial solar eclipse visible from Pacific region',
        magnitude: 0.7,
        duration: 120,
        visibility: { jerusalem: false, global: false, regions: ['Pacific', 'Australia'] },
        propheticSignificance: 'medium',
      },
      {
        id: 'conjunction-2025-05-17',
        type: 'conjunction',
        date: new Date('2025-05-17'),
        name: 'Jupiter-Venus Conjunction',
        description: 'Close conjunction of Jupiter and Venus',
        magnitude: 0.8,
        visibility: { jerusalem: true, global: true, regions: ['Global'] },
        propheticSignificance: 'medium',
      },
    ]
  }

  const stats = getCorrelationStats(feastCorrelations)
  const mostSignificant = getMostSignificantCorrelation(feastCorrelations)

  const filteredEvents = filterByFeast 
    ? feastCorrelations.map(c => c.event)
    : [...celestialEvents, ...earthEvents]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400" />
                Watchman's View
              </h1>
              <p className="mt-2 text-purple-300 text-sm">
                "I have posted watchmen on your walls, Jerusalem; they will never be silent day or night." - Isaiah 62:6
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterByFeast(!filterByFeast)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterByFeast
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filterByFeast ? '✡️ Feast Days Only' : 'All Events'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Events"
            value={filteredEvents.length}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Critical Correlations"
            value={stats.critical}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="High Significance"
            value={stats.high}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title="Feast Correlations"
            value={stats.total}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Avg Score"
            value={Math.round(stats.averageScore)}
            icon={Sparkles}
            color="yellow"
          />
        </div>

        {/* Most Significant Correlation Alert */}
        {mostSignificant && mostSignificant.significance === 'critical' && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-300 font-bold text-lg">CRITICAL PROPHETIC SIGNATURE DETECTED</h3>
                <p className="text-red-200 mt-1">
                  {mostSignificant.feast.name} correlation (Score: {mostSignificant.correlationScore}/100)
                </p>
                <ul className="mt-2 space-y-1">
                  {mostSignificant.reasoning.slice(0, 3).map((reason, idx) => (
                    <li key={idx} className="text-sm text-red-300">• {reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ML-Powered Backend Alerts */}
        {mlAlerts.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              ML-Powered Prophetic Alerts (Backend TensorFlow/Keras)
            </h2>
            {mlAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id} 
                className={`rounded-lg p-4 border ${
                  alert.severity === 'critical' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : alert.severity === 'warning'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-1 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-orange-400' :
                    'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <h3 className={`font-bold ${
                      alert.severity === 'critical' ? 'text-red-300' :
                      alert.severity === 'warning' ? 'text-orange-300' :
                      'text-blue-300'
                    }`}>
                      {alert.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      alert.severity === 'critical' ? 'text-red-200' :
                      alert.severity === 'warning' ? 'text-orange-200' :
                      'text-blue-200'
                    }`}>
                      {alert.message}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      {alert.confidence !== undefined && (
                        <span className="text-slate-400">
                          Confidence: {(alert.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      {alert.biblicalReferences && alert.biblicalReferences.length > 0 && (
                        <span className="text-purple-300">
                          📖 {alert.biblicalReferences[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {mlAlerts.length > 3 && (
              <p className="text-sm text-slate-400 text-center">
                + {mlAlerts.length - 3} more alerts (view in Alerts page)
              </p>
            )}
          </div>
        )}

        {/* Hebrew Feasts Timeline */}
        <div className="mb-8 bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Hebrew Feasts {new Date().getFullYear()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hebrewFeasts.map((feast) => {
              const feastEvents = feastCorrelations.filter(c => c.feast.name === feast.name)
              return (
                <div
                  key={feast.name}
                  className={`p-4 rounded-lg border ${
                    feastEvents.length > 0
                      ? 'bg-purple-500/20 border-purple-400/40'
                      : 'bg-slate-700/30 border-slate-600/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{feast.name}</h3>
                    {feastEvents.length > 0 && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        {feastEvents.length}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-purple-300">{feast.hebrewName}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatFeastDateRange(feast)}</p>
                  <p className="text-xs text-slate-500 mt-2">{feast.biblicalReference}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-purple-500/20">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              Events with Prophetic Correlation
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Feast Correlation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    AI Prediction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Significance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredEvents.slice(0, 20).map((event) => {
                  const correlation = feastCorrelations.find(c => c.event.id === event.id)
                  const prediction = predictions.get(event.id)
                  
                  return (
                    <tr key={event.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {event.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {'name' in event ? event.name : event.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {correlation ? (
                          <div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCorrelationColor(correlation.significance)}`}>
                              ✡️ {correlation.feast.hebrewName}
                            </span>
                            <span className="ml-2 text-xs text-slate-400">
                              {correlation.correlationScore}/100
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">No correlation</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {prediction ? (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getSignificanceColor(prediction.category || 'low')}`}>
                              {prediction.category || prediction.predictedSignificance || 'unknown'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {Math.round((prediction.confidence || prediction.confidenceScore || 0) * 100)}%
                            </span>
                            {prediction.isAnomaly && (
                              <span className="text-xs text-yellow-400">⚠️</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.propheticSignificance === 'critical' ? 'bg-red-500/20 text-red-300' :
                          event.propheticSignificance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                          event.propheticSignificance === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {event.propheticSignificance || 'low'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Theological Framework */}
        <div className="mt-8 bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Theological Framework
          </h2>
          <div className="space-y-3 text-slate-300">
            <p className="text-sm">
              <strong className="text-purple-300">Eschatology:</strong> Literal, premillennial interpretation
            </p>
            <p className="text-sm">
              <strong className="text-purple-300">Key Scriptures:</strong> Matthew 24 (Olivet Discourse), 
              Luke 21 (Signs in heavens), Mark 13 (End times warnings)
            </p>
            <p className="text-sm">
              <strong className="text-purple-300">Correlation Focus:</strong> Celestial signs (sun, moon, stars) 
              correlated with seismic activity (earthquakes, σεισμός) and solar events
            </p>
            <p className="text-sm">
              <strong className="text-purple-300">Approach:</strong> Respectful, scholarly analysis of 
              patterns between biblical prophecy and observable phenomena
            </p>
            <p className="text-xs text-slate-400 mt-4">
              "And there will be signs in the sun, in the moon, and in the stars; and on the earth distress 
              of nations, with perplexity, the sea and the waves roaring." - Luke 21:25 (NKJV)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
const StatCard = ({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: any
  color: string
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    red: 'bg-red-500/10 border-red-500/30 text-red-300',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  }

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  )
}

// Helper Functions
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    blood_moon: 'bg-red-500/20 text-red-300',
    solar_eclipse: 'bg-orange-500/20 text-orange-300',
    lunar_eclipse: 'bg-purple-500/20 text-purple-300',
    conjunction: 'bg-blue-500/20 text-blue-300',
    earthquake: 'bg-yellow-500/20 text-yellow-300',
    volcanic: 'bg-red-500/20 text-red-300',
    geomagnetic: 'bg-purple-500/20 text-purple-300',
    solar_flare: 'bg-orange-500/20 text-orange-300',
  }
  return colors[type] || 'bg-slate-500/20 text-slate-300'
}

function getCorrelationColor(significance: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  }
  return colors[significance] || 'bg-slate-500/20 text-slate-300'
}

function getSignificanceColor(significance: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300',
    high: 'bg-orange-500/20 text-orange-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    low: 'bg-blue-500/20 text-blue-300',
  }
  return colors[significance] || 'bg-slate-500/20 text-slate-300'
}

export default WatchmansView
