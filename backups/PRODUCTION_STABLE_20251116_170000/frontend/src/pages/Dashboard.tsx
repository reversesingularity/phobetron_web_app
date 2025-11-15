import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Mountain, Orbit, TrendingUp, MapPin, AlertTriangle } from 'lucide-react'
import { earthquakesAPI, volcanicAPI, neoAPI } from '../services/api'
import type { Earthquake, VolcanicActivity, NEOCloseApproach } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    earthquakes: 0,
    volcanic: 0,
    neo: 0,
    loading: true,
  })
  const [recentEarthquakes, setRecentEarthquakes] = useState<Earthquake[]>([])
  const [recentVolcanic, setRecentVolcanic] = useState<VolcanicActivity[]>([])
  const [closestNEO, setClosestNEO] = useState<NEOCloseApproach[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [eqRes, volRes, neoRes] = await Promise.all([
        earthquakesAPI.getAll({ limit: 5 }),
        volcanicAPI.getAll({ limit: 5 }),
        neoAPI.getAll({ limit: 5, max_distance_au: 0.1 }),
      ])

      setStats({
        earthquakes: eqRes.data.total,
        volcanic: volRes.data.total,
        neo: neoRes.data.total,
        loading: false,
      })

      setRecentEarthquakes(eqRes.data.data)
      setRecentVolcanic(volRes.data.data)
      setClosestNEO(neoRes.data.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    link,
  }: {
    title: string
    value: number
    icon: any
    color: string
    link: string
  }) => (
    <Link
      to={link}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.loading ? '...' : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Link>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Real-time tracking of earthquakes, volcanic activity, and near-Earth objects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Recent Earthquakes"
          value={stats.earthquakes}
          icon={Activity}
          color="bg-red-600"
          link="/earthquakes"
        />
        <StatCard
          title="Volcanic Events"
          value={stats.volcanic}
          icon={Mountain}
          color="bg-orange-600"
          link="/volcanic"
        />
        <StatCard
          title="NEO Close Approaches"
          value={stats.neo}
          icon={Orbit}
          color="bg-blue-600"
          link="/neo"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/map"
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <div className="flex items-center gap-4">
            <MapPin size={32} />
            <div>
              <h3 className="text-xl font-bold">View Interactive Map</h3>
              <p className="text-blue-100 text-sm mt-1">
                Explore all events on a global map
              </p>
            </div>
          </div>
        </Link>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <TrendingUp size={32} />
            <div>
              <h3 className="text-xl font-bold">Real-time Updates</h3>
              <p className="text-purple-100 text-sm mt-1">
                Data from USGS, NASA, and GVP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Earthquakes */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity size={20} className="text-red-500" />
              Recent Earthquakes
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {recentEarthquakes.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Loading...</p>
            ) : (
              recentEarthquakes.map((eq) => (
                <div
                  key={eq.id}
                  className="flex justify-between items-start p-3 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">M{eq.magnitude.toFixed(1)}</p>
                    <p className="text-gray-400 text-sm">{eq.region}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(eq.event_time).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">{eq.depth_km.toFixed(0)} km deep</span>
                </div>
              ))
            )}
            <Link
              to="/earthquakes"
              className="block text-center text-blue-400 hover:text-blue-300 text-sm pt-2"
            >
              View all earthquakes →
            </Link>
          </div>
        </div>

        {/* Close NEO Approaches */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              Closest NEO Approaches
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {closestNEO.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Loading...</p>
            ) : (
              closestNEO.map((neo) => (
                <div
                  key={neo.id}
                  className="flex justify-between items-start p-3 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{neo.object_name.split('(')[0].trim()}</p>
                    <p className="text-gray-400 text-sm">
                      {neo.miss_distance_lunar.toFixed(1)} lunar distances
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(neo.approach_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    ~{neo.estimated_diameter_m.toFixed(0)}m
                  </span>
                </div>
              ))
            )}
            <Link
              to="/neo"
              className="block text-center text-blue-400 hover:text-blue-300 text-sm pt-2"
            >
              View all NEO approaches →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
