import { useEffect, useState } from 'react'
import { volcanicAPI } from '../services/api'
import type { VolcanicActivity } from '../services/api'
import { Mountain, MapPin, Activity } from 'lucide-react'

const VolcanicPage = () => {
  const [volcanic, setVolcanic] = useState<VolcanicActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadVolcanic()
  }, [])

  const loadVolcanic = async () => {
    setLoading(true)
    try {
      const res = await volcanicAPI.getAll({ limit: 50 })
      setVolcanic(res.data.data)
      setTotal(res.data.total)
    } catch (error) {
      console.error('Error loading volcanic data:', error)
    }
    setLoading(false)
  }

  const getVEIColor = (vei: number) => {
    if (vei >= 4) return 'bg-red-600'
    if (vei === 3) return 'bg-orange-600'
    if (vei === 2) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  const getVEILabel = (vei: number) => {
    const labels: { [key: number]: string } = {
      0: 'Non-explosive',
      1: 'Small',
      2: 'Moderate',
      3: 'Large',
      4: 'Cataclysmic',
      5: 'Paroxysmal',
      6: 'Colossal',
      7: 'Super-colossal',
      8: 'Mega-colossal',
    }
    return labels[vei] || 'Unknown'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Mountain className="text-orange-500" />
          Volcanic Activity
        </h1>
        <p className="text-gray-400 mt-2">
          Recent volcanic eruptions and ongoing activity
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-gray-300">
          <span className="text-lg font-semibold text-white">{total}</span> volcanic events tracked
        </div>
      </div>

      {/* Volcanic Events List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-white text-lg">Loading volcanic activity...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {volcanic.map((vol) => (
            <div
              key={vol.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`px-3 py-1 rounded-lg ${getVEIColor(vol.vei)} text-white font-bold`}>
                      VEI {vol.vei}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-xl">{vol.volcano_name}</h3>
                      <p className="text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {vol.country}
                      </p>
                    </div>
                  </div>
                </div>

                {vol.eruption_end === null && (
                  <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm font-medium border border-orange-600/30">
                    Ongoing
                  </span>
                )}
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-gray-300 italic">{vol.notes}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Eruption Type</p>
                  <p className="text-white font-medium capitalize">{vol.eruption_type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">VEI Classification</p>
                  <p className="text-white font-medium">{getVEILabel(vol.vei)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Plume Height</p>
                  <p className="text-white font-medium">{vol.plume_height_km} km</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Data Source</p>
                  <p className="text-white font-medium">{vol.data_source}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Started</p>
                  <p className="text-white">{new Date(vol.eruption_start).toLocaleString()}</p>
                </div>
                {vol.eruption_end && (
                  <div>
                    <p className="text-gray-400">Ended</p>
                    <p className="text-white">{new Date(vol.eruption_end).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Location: {Number(vol.latitude).toFixed(4)}°, {Number(vol.longitude).toFixed(4)}°
              </div>
            </div>
          ))}
        </div>
      )}

      {volcanic.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">No volcanic activity data available</p>
        </div>
      )}

      {/* VEI Scale Reference */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">Volcanic Explosivity Index (VEI)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { vei: 0, label: 'Non-explosive' },
            { vei: 1, label: 'Small' },
            { vei: 2, label: 'Moderate' },
            { vei: 3, label: 'Large' },
            { vei: 4, label: 'Cataclysmic' },
            { vei: 5, label: 'Paroxysmal' },
            { vei: 6, label: 'Colossal' },
            { vei: 7, label: 'Super-colossal' },
          ].map((item) => (
            <div key={item.vei} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded ${getVEIColor(item.vei)} text-white font-bold flex items-center justify-center text-sm`}>
                {item.vei}
              </div>
              <span className="text-gray-300 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VolcanicPage
