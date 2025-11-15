import { useEffect, useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle, Sun, Moon, Activity, Brain, Zap, Target } from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts'

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
  is_anomaly?: boolean
}

interface Prediction {
  feast_day: string
  feast_date: string
  risk_score: number
  confidence: number
  predicted_event_types: string[]
  probability_by_type: Record<string, number>
  historical_correlation: number
  anomaly_score: number
  risk_level: string
}

interface SeasonalData {
  Spring: { count: number; avg_correlation: number; events: number[] }
  Summer: { count: number; avg_correlation: number; events: number[] }
  Fall: { count: number; avg_correlation: number; events: number[] }
  Winter: { count: number; avg_correlation: number; events: number[] }
}

interface AdvancedPatternData {
  success: boolean
  patterns: Pattern[]
  statistics: {
    total_patterns: number
    high_correlation_count: number
    average_correlation: number
    total_events_analyzed: number
    feast_days_in_range: number
    anomaly_count: number
  }
  statistical_analysis: {
    pearson_correlation: number
    spearman_correlation: number
    p_value: number
    is_statistically_significant: boolean
    confidence_interval_95: { lower: number; upper: number }
    confidence_interval_99: { lower: number; upper: number }
    sample_size: number
  }
  correlation_matrix: Record<string, Record<string, number>>
  seasonal_patterns: SeasonalData
  predictions: Prediction[]
  metadata: {
    date_range: { start: string; end: string }
    analysis_method: string
    ml_models_used: string[]
    window_days: number
    forecast_horizon_days: number
  }
}

export default function AdvancedPatternDetectionPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patternData, setPatternData] = useState<AdvancedPatternData | null>(null)
  const [startYear, setStartYear] = useState(2020)
  const [endYear, setEndYear] = useState(2030)
  const [forecastDays, setForecastDays] = useState(90)
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'statistics' | 'visualizations'>('overview')

  useEffect(() => {
    fetchAdvancedPatterns()
  }, [])

  const fetchAdvancedPatterns = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Backend is running on port 8000
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      
      const startDate = `${startYear}-01-01`
      const endDate = `${endYear}-12-31`
      
      // Use comprehensive-pattern-detection endpoint with real ML data
      const response = await fetch(
        `${apiUrl}/api/v1/ml/comprehensive-pattern-detection?start_date=${startDate}&end_date=${endDate}&min_magnitude=6.0&time_window_days=14&include_historical=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      // Use real ML data from trained models
      const transformedData: AdvancedPatternData = {
        success: data.success,
        patterns: data.patterns?.map((p: any) => ({
          ...p,
          is_anomaly: p.anomaly_score > 0.8 // Use real anomaly scores from isolation forest
        })) || [],
        statistics: {
          ...data.statistics,
          anomaly_count: data.patterns?.filter((p: any) => p.anomaly_score > 0.8).length || 0
        },
        statistical_analysis: data.statistical_analysis || {
          pearson_correlation: 0,
          spearman_correlation: 0,
          p_value: 1,
          is_statistically_significant: false,
          confidence_interval_95: { lower: 0, upper: 0 },
          confidence_interval_99: { lower: 0, upper: 0 },
          sample_size: data.patterns?.length || 0
        },
        correlation_matrix: data.correlation_matrix || {},
        seasonal_patterns: data.seasonal_patterns || {
          Spring: { count: 0, avg_correlation: 0, events: [] },
          Summer: { count: 0, avg_correlation: 0, events: [] },
          Fall: { count: 0, avg_correlation: 0, events: [] },
          Winter: { count: 0, avg_correlation: 0, events: [] }
        },
        predictions: data.predictions || [],
        metadata: {
          date_range: { start: startDate, end: endDate },
          analysis_method: data.metadata?.analysis_method || "ML Pattern Detection",
          ml_models_used: data.metadata?.ml_models_used || ["Isolation Forest", "Correlation Analysis", "Statistical Tests"],
          window_days: data.metadata?.window_days || 14,
          forecast_horizon_days: forecastDays
        }
      }
      
      setPatternData(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load advanced pattern data')
      console.error('Error fetching advanced patterns:', err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare seasonal chart data
  const getSeasonalChartData = () => {
    if (!patternData?.seasonal_patterns) return []
    
    return Object.entries(patternData.seasonal_patterns).map(([season, data]) => ({
      season,
      correlation: data.avg_correlation,
      count: data.count
    }))
  }

  // Prepare correlation heatmap data
  const getHeatmapData = () => {
    if (!patternData?.correlation_matrix) return []
    
    const matrix = patternData.correlation_matrix
    const data: Array<{ feast: string; earthquake: number; volcanic: number; hurricane: number; tsunami: number }> = []
    
    Object.entries(matrix).forEach(([feast, events]) => {
      data.push({
        feast: feast.substring(0, 20), // Truncate long names
        earthquake: events.earthquake || 0,
        volcanic: events.volcanic || 0,
        hurricane: events.hurricane || 0,
        tsunami: events.tsunami || 0
      })
    })
    
    return data.slice(0, 10) // Top 10 feasts
  }

  // Colors for visualizations
  const COLORS = {
    earthquake: '#ef4444',
    volcanic: '#f97316',
    hurricane: '#06b6d4',
    tsunami: '#14b8a6',
    high: '#dc2626',
    medium: '#f59e0b',
    low: '#3b82f6'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400 text-lg">AI analyzing patterns...</p>
              <p className="text-sm text-gray-500 mt-2">Running ML models and statistical tests</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-red-400">Error Loading Advanced Analysis</h3>
            </div>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={fetchAdvancedPatterns}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition font-semibold"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 text-transparent bg-clip-text">
              AI-Powered Pattern Detection
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Advanced ML analytics with predictive modeling and statistical significance testing
          </p>
          <div className="flex gap-2 mt-3">
            {patternData?.metadata.ml_models_used.map((model, i) => (
              <span key={i} className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs border border-purple-700/50">
                {model}
              </span>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Year
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                min="1900"
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                min="1900"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Forecast Days
              </label>
              <select
                value={forecastDays}
                onChange={(e) => setForecastDays(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days</option>
                <option value={365}>1 Year</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAdvancedPatterns}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition font-semibold shadow-lg shadow-purple-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Run AI Analysis
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'predictions', label: 'Predictions', icon: Target },
            { id: 'statistics', label: 'Statistics', icon: Activity },
            { id: 'visualizations', label: 'Charts', icon: Sun }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {patternData && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl p-6 border border-purple-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-purple-300">Total Patterns</h3>
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-4xl font-black text-white mb-2">{patternData.statistics.total_patterns}</p>
                    <p className="text-sm text-gray-400">
                      {patternData.statistics.anomaly_count} anomalies detected
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 rounded-xl p-6 border border-pink-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-pink-300">Statistical Significance</h3>
                      <Activity className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-4xl font-black text-white mb-2">
                      {patternData.statistical_analysis.is_statistically_significant ? 'YES' : 'NO'}
                    </p>
                    <p className="text-sm text-gray-400">
                      p-value: {patternData.statistical_analysis.p_value.toFixed(4)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-6 border border-blue-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-blue-300">High Risk Predictions</h3>
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-4xl font-black text-white mb-2">
                      {patternData.predictions.filter(p => p.risk_level === 'High').length}
                    </p>
                    <p className="text-sm text-gray-400">
                      Next {forecastDays} days
                    </p>
                  </div>
                </div>

                {/* Patterns List */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    Detected Patterns
                  </h2>
                  <div className="space-y-4">
                    {patternData.patterns.slice(0, 10).map((pattern, index) => (
                      <div
                        key={index}
                        className={`bg-gray-900/50 rounded-lg p-4 border ${
                          pattern.is_anomaly 
                            ? 'border-yellow-500/50 bg-yellow-900/10' 
                            : 'border-gray-700/50'
                        } hover:border-purple-500/50 transition`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-blue-400" />
                              <h3 className="font-semibold text-lg text-white">
                                {pattern.feast_day}
                              </h3>
                              <span className="text-sm text-gray-400">
                                {new Date(pattern.feast_date).toLocaleDateString()}
                              </span>
                              {pattern.is_anomaly && (
                                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs border border-yellow-700/50">
                                  ⚠️ Anomaly
                                </span>
                              )}
                            </div>
                            
                            {pattern.events && pattern.events.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                {pattern.events.map((event, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm bg-gray-800/50 rounded px-3 py-2"
                                  >
                                    <span className="capitalize text-gray-300">{event.type}</span>
                                    {event.magnitude && (
                                      <span className="text-orange-400">M{event.magnitude.toFixed(1)}</span>
                                    )}
                                    <span className="ml-auto text-xs text-gray-500">
                                      {event.days_from_feast > 0 ? '+' : ''}{event.days_from_feast}d
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-3xl font-bold text-white">
                              {pattern.correlation_score.toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {pattern.event_count} events
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <div className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">AI Risk Predictions</h2>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Bayesian probability forecasts for upcoming feast days ({forecastDays} day horizon)
                  </p>

                  <div className="space-y-4">
                    {patternData.predictions.map((pred, index) => (
                      <div
                        key={index}
                        className={`bg-gray-900/50 rounded-lg p-6 border ${
                          pred.risk_level === 'High' ? 'border-red-500/50' :
                          pred.risk_level === 'Medium' ? 'border-orange-500/50' :
                          'border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{pred.feast_day}</h3>
                              <span className="text-sm text-gray-400">
                                {new Date(pred.feast_date).toLocaleDateString()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                pred.risk_level === 'High' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                pred.risk_level === 'Medium' ? 'bg-orange-900/50 text-orange-300 border border-orange-700' :
                                'bg-blue-900/50 text-blue-300 border border-blue-700'
                              }`}>
                                {pred.risk_level} Risk
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              {Object.entries(pred.probability_by_type).map(([type, prob]) => (
                                <div key={type} className="bg-gray-800/50 rounded p-3">
                                  <p className="text-xs text-gray-400 capitalize mb-1">{type}</p>
                                  <p className="text-lg font-bold text-white">{(prob * 100).toFixed(0)}%</p>
                                  <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                                    <div 
                                      className={`h-1.5 rounded-full ${
                                        type === 'earthquake' ? 'bg-red-500' :
                                        type === 'volcanic' ? 'bg-orange-500' :
                                        type === 'hurricane' ? 'bg-cyan-500' :
                                        'bg-teal-500'
                                      }`}
                                      style={{ width: `${prob * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="text-right ml-6">
                            <p className="text-sm text-gray-400 mb-1">Risk Score</p>
                            <p className="text-5xl font-black text-white mb-2">
                              {pred.risk_score.toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(pred.confidence * 100).toFixed(0)}% confidence
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Correlation Metrics */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl p-6 border border-purple-700/50 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Correlation Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Pearson Coefficient</span>
                        <span className="text-xl font-bold text-white">
                          {patternData.statistical_analysis.pearson_correlation.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Spearman Coefficient</span>
                        <span className="text-xl font-bold text-white">
                          {patternData.statistical_analysis.spearman_correlation.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">P-Value</span>
                        <span className="text-xl font-bold text-white">
                          {patternData.statistical_analysis.p_value.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sample Size</span>
                        <span className="text-xl font-bold text-white">
                          {patternData.statistical_analysis.sample_size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Intervals */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-6 border border-blue-700/50 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      Confidence Intervals
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">95% Confidence Interval</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {patternData.statistical_analysis.confidence_interval_95.lower.toFixed(2)}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-lg font-bold text-white">
                            {patternData.statistical_analysis.confidence_interval_95.upper.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">99% Confidence Interval</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {patternData.statistical_analysis.confidence_interval_99.lower.toFixed(2)}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-lg font-bold text-white">
                            {patternData.statistical_analysis.confidence_interval_99.upper.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visualizations Tab */}
            {activeTab === 'visualizations' && (
              <div className="space-y-8">
                {/* Seasonal Patterns Chart */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sun className="w-6 h-6 text-yellow-400" />
                    Seasonal Pattern Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSeasonalChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="season" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="correlation" fill="#8b5cf6" name="Avg Correlation" />
                      <Bar dataKey="count" fill="#ec4899" name="Pattern Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Correlation Heatmap */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-pink-400" />
                    Event Type Correlation Matrix
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getHeatmapData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="feast" type="category" stroke="#9ca3af" width={150} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="earthquake" stackId="a" fill={COLORS.earthquake} name="Earthquake" />
                      <Bar dataKey="volcanic" stackId="a" fill={COLORS.volcanic} name="Volcanic" />
                      <Bar dataKey="hurricane" stackId="a" fill={COLORS.hurricane} name="Hurricane" />
                      <Bar dataKey="tsunami" stackId="a" fill={COLORS.tsunami} name="Tsunami" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
