import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Globe, Eye } from 'lucide-react'
import { fetchAnalytics, fetchRealtimeAnalytics } from '../../hooks/useAnalytics'

interface AnalyticsStats {
  period_days: number
  total_visits: number
  visits_today: number
  top_countries: Array<{ country: string; visits: number }>
  top_pages: Array<{ path: string; visits: number }>
  daily_visits: Array<{ date: string; visits: number }>
  top_referrers: Array<{ referrer: string; visits: number }>
  last_updated: string
}

interface RealtimeStats {
  visits_last_5min: number
  active_pages: Array<{ path: string; visits: number }>
  timestamp: string
}

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [realtime, setRealtime] = useState<RealtimeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    loadAnalytics()
    loadRealtime()

    // Refresh realtime stats every 30 seconds
    const realtimeInterval = setInterval(loadRealtime, 30000)

    return () => clearInterval(realtimeInterval)
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await fetchAnalytics(period)
      setStats(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealtime = async () => {
    try {
      const data = await fetchRealtimeAnalytics()
      setRealtime(data)
    } catch (error) {
      console.debug('Error loading realtime analytics:', error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Visitor Analytics</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === days
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Stats */}
      {realtime && (
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Eye className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-semibold">LIVE - Last 5 Minutes</span>
          </div>
          <div className="text-3xl font-bold text-white">{realtime.visits_last_5min} visits</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Visits"
          value={stats.total_visits.toLocaleString()}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Visits Today"
          value={stats.visits_today.toLocaleString()}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Countries"
          value={stats.top_countries.length.toString()}
          icon={Globe}
          color="purple"
        />
      </div>

      {/* Daily Visits Chart */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Visits Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.daily_visits.slice().reverse()}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(6,182,212,0.5)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="visits" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Pages & Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
          <div className="space-y-3">
            {stats.top_pages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm truncate flex-1">{page.path}</span>
                <span className="text-cyan-400 font-semibold ml-4">{page.visits}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-3">
            {stats.top_countries.slice(0, 5).map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">
                  {country.country || 'Unknown'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-white/20 rounded-full w-24">
                    <div
                      className="h-2 bg-cyan-500 rounded-full"
                      style={{
                        width: `${(country.visits / stats.total_visits) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-cyan-400 font-semibold w-12 text-right">
                    {country.visits}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      {stats.top_referrers.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Top Referrers</h3>
          <div className="space-y-2">
            {stats.top_referrers.slice(0, 5).map((ref, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate flex-1">{ref.referrer}</span>
                <span className="text-cyan-400 ml-4">{ref.visits} visits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs">
        Last updated: {new Date(stats.last_updated).toLocaleString()}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'cyan' | 'blue' | 'purple'
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
  }

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md rounded-xl p-6 border`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 text-sm">{title}</span>
        <Icon className={`h-5 w-5 ${colorClasses[color].split(' ')[3]}`} />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  )
}

export default AnalyticsDashboard
