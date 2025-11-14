/**
 * Prophecy Codex - Biblical Prophecy Database
 * 
 * Comprehensive database of biblical prophecies related to:
 * - Celestial signs (sun, moon, stars)
 * - Seismic events (earthquakes, σεισμός)
 * - End times eschatology
 * - Restoration and judgment
 */

import { useState, useEffect } from 'react'
import { Book, Search, Star, AlertTriangle, Calendar, Loader2 } from 'lucide-react'
import type { BiblicalProphecy } from '../lib/types/celestial'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phobetronwebapp-production.up.railway.app'

interface DbProphecy {
  id: number
  event_name: string
  prophecy_category: string | null
  book_name: string
  chapter: number | null
  verse_start: number | null
  verse_end: number | null
  prophecy_text: string | null
  source_type: string | null
  chronological_order: number | null
  fulfillment_status: string | null
  theological_interpretation: string | null
  created_at: string
}

const ProphecyCodex = () => {
  const [prophecies, setProphecies] = useState<BiblicalProphecy[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedProphecy, setSelectedProphecy] = useState<BiblicalProphecy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProphecies()
  }, [])

  const fetchProphecies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/api/v1/theological/prophecies?limit=100`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Convert database prophecies to UI format
      const converted: BiblicalProphecy[] = data.data.map((p: DbProphecy) => {
        // Build reference string - handle missing chapter/verse data
        let reference = p.book_name || 'Unknown'
        if (p.chapter && p.verse_start) {
          if (p.verse_end && p.verse_end !== p.verse_start) {
            reference = `${p.book_name} ${p.chapter}:${p.verse_start}-${p.verse_end}`
          } else {
            reference = `${p.book_name} ${p.chapter}:${p.verse_start}`
          }
        } else if (p.chapter) {
          reference = `${p.book_name} ${p.chapter}`
        }
        
        return {
          id: p.id.toString(),
          reference,
          text: p.prophecy_text || p.event_name,
          category: (p.prophecy_category || 'general').toLowerCase(),
          keywords: p.event_name.split(' ').filter(w => w.length > 3),
          eschatologicalContext: p.theological_interpretation || '',
          fulfillmentStatus: (p.fulfillment_status || 'future').toLowerCase() as 'fulfilled' | 'ongoing' | 'partial' | 'future',
          relatedProphecies: [],
          hebrewWords: [],
          greekWords: [],
        }
      })
      
      setProphecies(converted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prophecies')
      console.error('Error fetching prophecies:', err)
      // Fallback to mock data on error
      setProphecies(generateMockProphecies())
    } finally {
      setLoading(false)
    }
  }

  const generateMockProphecies = (): BiblicalProphecy[] => {
    return [
      {
        id: 'joel-2-31',
        reference: 'Joel 2:31',
        text: 'The sun will be turned to darkness and the moon to blood before the coming of the great and dreadful day of the LORD.',
        category: 'celestial',
        keywords: ['sun', 'moon', 'blood', 'darkness', 'day of the LORD'],
        hebrewWords: [
          { word: 'דָּם', transliteration: 'dam', strongsNumber: 'H1818', meaning: 'blood' },
          { word: 'חֹשֶׁךְ', transliteration: 'choshek', strongsNumber: 'H2822', meaning: 'darkness' },
        ],
        eschatologicalContext: 'End times judgment, celestial signs preceding the Day of the LORD',
        fulfillmentStatus: 'partial',
        relatedProphecies: ['acts-2-20', 'matthew-24-29', 'revelation-6-12'],
      },
      {
        id: 'matthew-24-7',
        reference: 'Matthew 24:7',
        text: 'Nation will rise against nation, and kingdom against kingdom. There will be famines and earthquakes in various places.',
        category: 'seismic',
        keywords: ['nation', 'kingdom', 'earthquakes', 'famines', 'various places'],
        greekWords: [
          { word: 'σεισμός', transliteration: 'seismos', strongsNumber: 'G4578', meaning: 'earthquake, commotion, tempest' },
        ],
        eschatologicalContext: 'Olivet Discourse - signs of the end times',
        fulfillmentStatus: 'ongoing',
        relatedProphecies: ['luke-21-11', 'mark-13-8', 'revelation-6-12'],
      },
      {
        id: 'matthew-24-29',
        reference: 'Matthew 24:29',
        text: 'Immediately after the distress of those days the sun will be darkened, and the moon will not give its light; the stars will fall from the sky, and the heavenly bodies will be shaken.',
        category: 'celestial',
        keywords: ['sun', 'moon', 'stars', 'darkened', 'heavenly bodies', 'shaken'],
        greekWords: [
          { word: 'ἥλιος', transliteration: 'helios', strongsNumber: 'G2246', meaning: 'sun' },
          { word: 'σελήνη', transliteration: 'selene', strongsNumber: 'G4582', meaning: 'moon' },
          { word: 'ἀστήρ', transliteration: 'aster', strongsNumber: 'G792', meaning: 'star' },
        ],
        eschatologicalContext: 'Cosmic disturbances immediately before the Second Coming',
        fulfillmentStatus: 'future',
        relatedProphecies: ['joel-2-31', 'acts-2-20', 'revelation-6-12'],
      },
      {
        id: 'luke-21-25',
        reference: 'Luke 21:25-26',
        text: 'There will be signs in the sun, moon and stars. On the earth, nations will be in anguish and perplexity at the roaring and tossing of the sea. People will faint from terror, apprehensive of what is coming on the world, for the heavenly bodies will be shaken.',
        category: 'celestial',
        keywords: ['signs', 'sun', 'moon', 'stars', 'nations', 'anguish', 'sea', 'terror'],
        greekWords: [
          { word: 'σημεῖον', transliteration: 'semeion', strongsNumber: 'G4592', meaning: 'sign, mark, token' },
        ],
        eschatologicalContext: 'Signs in heaven and earth preceding the return of Christ',
        fulfillmentStatus: 'ongoing',
        relatedProphecies: ['matthew-24-29', 'mark-13-24', 'revelation-6-12'],
      },
      {
        id: 'revelation-6-12',
        reference: 'Revelation 6:12-14',
        text: 'I watched as he opened the sixth seal. There was a great earthquake (σεισμός). The sun turned black like sackcloth made of goat hair, the whole moon turned blood red, and the stars in the sky fell to earth, as figs drop from a fig tree when shaken by a strong wind.',
        category: 'judgment',
        keywords: ['sixth seal', 'earthquake', 'sun black', 'moon blood', 'stars fell'],
        greekWords: [
          { word: 'σεισμός', transliteration: 'seismos', strongsNumber: 'G4578', meaning: 'earthquake, commotion' },
          { word: 'αἷμα', transliteration: 'haima', strongsNumber: 'G129', meaning: 'blood' },
        ],
        eschatologicalContext: 'Sixth seal judgment - cosmic catastrophe during the Tribulation',
        fulfillmentStatus: 'future',
        relatedProphecies: ['joel-2-31', 'matthew-24-29', 'isaiah-13-10'],
      },
      {
        id: 'acts-2-20',
        reference: 'Acts 2:20',
        text: 'The sun will be turned to darkness and the moon to blood before the coming of the great and glorious day of the Lord.',
        category: 'celestial',
        keywords: ['sun', 'darkness', 'moon', 'blood', 'day of the Lord'],
        greekWords: [
          { word: 'αἷμα', transliteration: 'haima', strongsNumber: 'G129', meaning: 'blood' },
          { word: 'σκότος', transliteration: 'skotos', strongsNumber: 'G4655', meaning: 'darkness' },
        ],
        eschatologicalContext: 'Peter quotes Joel 2:31 at Pentecost - dual fulfillment prophecy',
        fulfillmentStatus: 'partial',
        relatedProphecies: ['joel-2-31', 'matthew-24-29', 'revelation-6-12'],
      },
      {
        id: 'isaiah-13-10',
        reference: 'Isaiah 13:10',
        text: 'The stars of heaven and their constellations will not show their light. The rising sun will be darkened and the moon will not give its light.',
        category: 'celestial',
        keywords: ['stars', 'constellations', 'sun darkened', 'moon', 'light'],
        hebrewWords: [
          { word: 'כּוֹכָב', transliteration: 'kokab', strongsNumber: 'H3556', meaning: 'star' },
          { word: 'יָרֵחַ', transliteration: 'yareach', strongsNumber: 'H3394', meaning: 'moon' },
        ],
        eschatologicalContext: 'Day of the LORD judgment prophecy - celestial signs',
        fulfillmentStatus: 'future',
        relatedProphecies: ['joel-2-31', 'matthew-24-29', 'revelation-6-12'],
      },
      {
        id: 'mark-13-24',
        reference: 'Mark 13:24-25',
        text: 'But in those days, following that distress, the sun will be darkened, and the moon will not give its light; the stars will fall from the sky, and the heavenly bodies will be shaken.',
        category: 'celestial',
        keywords: ['sun darkened', 'moon', 'stars fall', 'heavenly bodies shaken'],
        greekWords: [
          { word: 'σκοτίζω', transliteration: 'skotizo', strongsNumber: 'G4654', meaning: 'to darken' },
        ],
        eschatologicalContext: 'Olivet Discourse parallel - cosmic signs before Second Coming',
        fulfillmentStatus: 'future',
        relatedProphecies: ['matthew-24-29', 'luke-21-25', 'joel-2-31'],
      },
      {
        id: 'revelation-8-10',
        reference: 'Revelation 8:10-11',
        text: 'The third angel sounded his trumpet, and a great star, blazing like a torch, fell from the sky on a third of the rivers and on the springs of water—the name of the star is Wormwood.',
        category: 'celestial',
        keywords: ['third trumpet', 'star', 'fell', 'Wormwood', 'rivers', 'bitter'],
        greekWords: [
          { word: 'ἀστήρ', transliteration: 'aster', strongsNumber: 'G792', meaning: 'star' },
          { word: 'Ἄψινθος', transliteration: 'Apsinthos', strongsNumber: 'G894', meaning: 'Wormwood (bitterness)' },
        ],
        eschatologicalContext: 'Third trumpet judgment - celestial object impacts Earth',
        fulfillmentStatus: 'future',
        relatedProphecies: ['revelation-6-13', 'isaiah-14-12'],
      },
      {
        id: 'luke-21-11',
        reference: 'Luke 21:11',
        text: 'There will be great earthquakes, famines and pestilences in various places, and fearful events and great signs from heaven.',
        category: 'seismic',
        keywords: ['earthquakes', 'famines', 'pestilences', 'signs from heaven'],
        greekWords: [
          { word: 'σεισμός', transliteration: 'seismos', strongsNumber: 'G4578', meaning: 'earthquake' },
        ],
        eschatologicalContext: 'Signs preceding the end times and Jerusalem\'s destruction',
        fulfillmentStatus: 'ongoing',
        relatedProphecies: ['matthew-24-7', 'mark-13-8'],
      },
    ]
  }

  const categories = [
    { value: 'all', label: 'All Prophecies', icon: Book },
    { value: 'celestial', label: 'Celestial Signs', icon: Star },
    { value: 'seismic', label: 'Seismic Events', icon: AlertTriangle },
    { value: 'judgment', label: 'Judgment', icon: Calendar },
    { value: 'end_times', label: 'End Times', icon: Calendar },
  ]

  const filteredProphecies = prophecies.filter(prophecy => {
    const matchesSearch = searchTerm === '' || 
      prophecy.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prophecy.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prophecy.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || prophecy.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: prophecies.length,
    celestial: prophecies.filter(p => p.category === 'celestial').length,
    seismic: prophecies.filter(p => p.category === 'seismic').length,
    fulfilled: prophecies.filter(p => p.fulfillmentStatus === 'fulfilled').length,
    ongoing: prophecies.filter(p => p.fulfillmentStatus === 'ongoing').length,
    future: prophecies.filter(p => p.fulfillmentStatus === 'future').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-white">Loading biblical prophecies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-amber-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Book className="w-8 h-8 text-amber-400" />
            Prophecy Codex
          </h1>
          <p className="mt-2 text-amber-300 text-sm">
            Comprehensive database of biblical prophecies - Literal premillennial eschatology
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total" value={stats.total} color="blue" />
          <StatCard title="Celestial" value={stats.celestial} color="purple" />
          <StatCard title="Seismic" value={stats.seismic} color="orange" />
          <StatCard title="Fulfilled" value={stats.fulfilled} color="green" />
          <StatCard title="Ongoing" value={stats.ongoing} color="yellow" />
          <StatCard title="Future" value={stats.future} color="red" />
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search prophecies by text, reference, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-amber-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    filterCategory === cat.value
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Prophecies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProphecies.map((prophecy) => (
            <div
              key={prophecy.id}
              onClick={() => setSelectedProphecy(prophecy)}
              className="bg-slate-800/50 rounded-lg p-6 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-amber-300">{prophecy.reference}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  prophecy.fulfillmentStatus === 'fulfilled' ? 'bg-green-500/20 text-green-300' :
                  prophecy.fulfillmentStatus === 'ongoing' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {prophecy.fulfillmentStatus}
                </span>
              </div>

              <p className="text-slate-300 text-sm mb-4 italic">"{prophecy.text}"</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {prophecy.keywords.slice(0, 5).map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded border border-amber-500/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-400">{prophecy.eschatologicalContext}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProphecies.length === 0 && (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Prophecies Found</h3>
            <p className="text-slate-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Prophecy Detail Modal */}
      {selectedProphecy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProphecy(null)}>
          <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-300">{selectedProphecy.reference}</h2>
              <button
                onClick={() => setSelectedProphecy(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white mb-2">Text</h3>
                <p className="text-slate-300 italic">"{selectedProphecy.text}"</p>
              </div>

              {selectedProphecy.hebrewWords && selectedProphecy.hebrewWords.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-2">Hebrew Words</h3>
                  <div className="space-y-2">
                    {selectedProphecy.hebrewWords.map((word) => (
                      <div key={word.strongsNumber} className="bg-slate-700/50 rounded p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{word.word}</span>
                          <div>
                            <p className="text-sm text-amber-300 font-medium">{word.transliteration}</p>
                            <p className="text-xs text-slate-400">{word.strongsNumber}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mt-2">{word.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProphecy.greekWords && selectedProphecy.greekWords.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-2">Greek Words</h3>
                  <div className="space-y-2">
                    {selectedProphecy.greekWords.map((word) => (
                      <div key={word.strongsNumber} className="bg-slate-700/50 rounded p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{word.word}</span>
                          <div>
                            <p className="text-sm text-amber-300 font-medium">{word.transliteration}</p>
                            <p className="text-xs text-slate-400">{word.strongsNumber}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mt-2">{word.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-white mb-2">Eschatological Context</h3>
                <p className="text-slate-300 text-sm">{selectedProphecy.eschatologicalContext}</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProphecy.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-amber-500/10 text-amber-300 text-sm rounded border border-amber-500/20"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProphecy.relatedProphecies.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-2">Related Prophecies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProphecy.relatedProphecies.map((relId) => {
                      const relatedProphecy = prophecies.find(p => p.id === relId)
                      return relatedProphecy ? (
                        <button
                          key={relId}
                          onClick={() => setSelectedProphecy(relatedProphecy)}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded border border-purple-500/30 hover:bg-purple-500/30"
                        >
                          {relatedProphecy.reference}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ title, value, color }: {
  title: string
  value: number
  color: string
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    green: 'bg-green-500/10 border-green-500/30 text-green-300',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    red: 'bg-red-500/10 border-red-500/30 text-red-300',
  }

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-4 text-center`}>
      <p className="text-xs opacity-80 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default ProphecyCodex
