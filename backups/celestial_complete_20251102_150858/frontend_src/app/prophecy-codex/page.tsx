/**
 * Prophecy Codex - Biblical Reference Interface with Celestial Theme
 * 
 * Features:
 * - Comprehensive scriptural texts for all categories
 * - Advanced search with scripture reference and text search
 * - Celestial theme with glowing elements
 */

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  SparklesIcon,
  ClockIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

// Comprehensive Biblical Prophecy Database
const PROPHECY_DATABASE: Record<string, {
  description: string;
  keyVerse: { reference: string; text: string };
  prophecies: Array<{
    id: string;
    event_name: string;
    scripture_reference: string;
    scripture_text: string;
    prophecy_category: string;
    related_events?: string[];
  }>;
}> = {
  'End Times': {
    description: 'Prophecies concerning the last days and the return of Christ',
    keyVerse: {
      reference: 'Matthew 24:3',
      text: 'Tell us, when shall these things be? and what shall be the sign of thy coming?'
    },
    prophecies: [
      {
        id: 'et-1',
        event_name: 'The Great Tribulation',
        scripture_reference: 'Matthew 24:21-22',
        scripture_text: 'For then there will be great tribulation, such as has not been since the beginning of the world until this time, no, nor ever shall be. And unless those days were shortened, no flesh would be saved; but for the elect\'s sake those days will be shortened.',
        prophecy_category: 'End Times',
        related_events: ['Second Coming', 'Rapture', 'Antichrist']
      },
      {
        id: 'et-2',
        event_name: 'Signs in the Heavens',
        scripture_reference: 'Luke 21:25-26',
        scripture_text: 'And there will be signs in the sun, in the moon, and in the stars; and on the earth distress of nations, with perplexity, the sea and the waves roaring.',
        prophecy_category: 'End Times',
        related_events: ['Celestial Signs', 'Second Coming']
      },
      {
        id: 'et-3',
        event_name: 'The Day of the Lord',
        scripture_reference: 'Joel 2:30-31',
        scripture_text: 'And I will show wonders in the heavens and in the earth: Blood and fire and pillars of smoke. The sun shall be turned into darkness, and the moon into blood, before the coming of the great and awesome day of the LORD.',
        prophecy_category: 'End Times',
        related_events: ['Blood Moons', 'Solar Eclipse', 'Judgment']
      }
    ]
  },
  'Messiah': {
    description: 'Prophecies of the coming Messiah, His birth, ministry, death, and resurrection',
    keyVerse: {
      reference: 'Isaiah 53:5',
      text: 'But He was wounded for our transgressions, He was bruised for our iniquities; The chastisement for our peace was upon Him, And by His stripes we are healed.'
    },
    prophecies: [
      {
        id: 'm-1',
        event_name: 'Virgin Birth',
        scripture_reference: 'Isaiah 7:14',
        scripture_text: 'Therefore the Lord Himself will give you a sign: Behold, the virgin shall conceive and bear a Son, and shall call His name Immanuel.',
        prophecy_category: 'Messiah',
        related_events: ['Incarnation', 'Jesus Birth']
      },
      {
        id: 'm-2',
        event_name: 'Born in Bethlehem',
        scripture_reference: 'Micah 5:2',
        scripture_text: 'But you, Bethlehem Ephrathah, Though you are little among the thousands of Judah, Yet out of you shall come forth to Me The One to be Ruler in Israel, Whose goings forth are from of old, From everlasting.',
        prophecy_category: 'Messiah',
        related_events: ['Nativity', 'Star of Bethlehem']
      },
      {
        id: 'm-3',
        event_name: 'Suffering Servant',
        scripture_reference: 'Isaiah 53:3-5',
        scripture_text: 'He is despised and rejected by men, A Man of sorrows and acquainted with grief. Surely He has borne our griefs And carried our sorrows. He was wounded for our transgressions, He was bruised for our iniquities.',
        prophecy_category: 'Messiah',
        related_events: ['Crucifixion', 'Atonement']
      }
    ]
  },
  'Israel': {
    description: 'Prophecies concerning the nation of Israel, its restoration, and role in God\'s plan',
    keyVerse: {
      reference: 'Genesis 12:3',
      text: 'I will bless those who bless you, And I will curse him who curses you; And in you all the families of the earth shall be blessed.'
    },
    prophecies: [
      {
        id: 'i-1',
        event_name: 'Rebirth of Israel',
        scripture_reference: 'Isaiah 66:8',
        scripture_text: 'Who has heard such a thing? Who has seen such things? Shall the earth be made to give birth in one day? Or shall a nation be born at once? For as soon as Zion was in labor, She gave birth to her children.',
        prophecy_category: 'Israel',
        related_events: ['1948 Declaration', 'Restoration']
      },
      {
        id: 'i-2',
        event_name: 'Gathering from Nations',
        scripture_reference: 'Ezekiel 36:24',
        scripture_text: 'For I will take you from among the nations, gather you out of all countries, and bring you into your own land.',
        prophecy_category: 'Israel',
        related_events: ['Aliyah', 'Return from Exile']
      }
    ]
  },
  'Celestial Signs': {
    description: 'Prophecies involving heavenly signs, astronomical events, and divine manifestations',
    keyVerse: {
      reference: 'Joel 2:31',
      text: 'The sun shall be turned into darkness, And the moon into blood, Before the coming of the great and awesome day of the LORD.'
    },
    prophecies: [
      {
        id: 'cs-1',
        event_name: 'Blood Moons',
        scripture_reference: 'Joel 2:31',
        scripture_text: 'The sun shall be turned into darkness, And the moon into blood, Before the coming of the great and awesome day of the LORD.',
        prophecy_category: 'Celestial Signs',
        related_events: ['Lunar Eclipse', 'Tetrad', 'Day of the Lord']
      },
      {
        id: 'cs-2',
        event_name: 'Stars Fall from Heaven',
        scripture_reference: 'Matthew 24:29',
        scripture_text: 'Immediately after the tribulation of those days the sun will be darkened, and the moon will not give its light; the stars will fall from heaven, and the powers of the heavens will be shaken.',
        prophecy_category: 'Celestial Signs',
        related_events: ['Meteor Shower', 'Second Coming']
      }
    ]
  },
  'Judgment': {
    description: 'Prophecies of divine judgment, wrath, and the final reckoning',
    keyVerse: {
      reference: 'Hebrews 9:27',
      text: 'And as it is appointed for men to die once, but after this the judgment.'
    },
    prophecies: [
      {
        id: 'j-1',
        event_name: 'Great White Throne',
        scripture_reference: 'Revelation 20:11-12',
        scripture_text: 'Then I saw a great white throne and Him who sat on it, from whose face the earth and the heaven fled away. And there was found no place for them. And I saw the dead, small and great, standing before God, and books were opened.',
        prophecy_category: 'Judgment',
        related_events: ['Final Judgment', 'Eternal Destiny']
      }
    ]
  },
  'Restoration': {
    description: 'Prophecies of renewal, redemption, and the restoration of all things',
    keyVerse: {
      reference: 'Acts 3:21',
      text: 'Whom heaven must receive until the times of restoration of all things, which God has spoken by the mouth of all His holy prophets since the world began.'
    },
    prophecies: [
      {
        id: 'r-1',
        event_name: 'New Heaven and New Earth',
        scripture_reference: 'Revelation 21:1',
        scripture_text: 'Now I saw a new heaven and a new earth, for the first heaven and the first earth had passed away. Also there was no more sea.',
        prophecy_category: 'Restoration',
        related_events: ['Eternal State', 'New Creation']
      },
      {
        id: 'r-2',
        event_name: 'No More Tears',
        scripture_reference: 'Revelation 21:4',
        scripture_text: 'And God will wipe away every tear from their eyes; there shall be no more death, nor sorrow, nor crying. There shall be no more pain, for the former things have passed away.',
        prophecy_category: 'Restoration',
        related_events: ['Eternal Life', 'Paradise']
      }
    ]
  }
};

export default function ProphecyCodexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'correlations'>('list');
  const [selectedProphecy, setSelectedProphecy] = useState<any | null>(null);
  
  const [starPositions] = useState(() => 
    Array.from({ length: 15 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3
    }))
  );

  const allProphecies = useMemo(() => {
    return Object.values(PROPHECY_DATABASE).flatMap(cat => cat.prophecies);
  }, []);

  const filteredProphecies = useMemo(() => {
    let filtered = selectedCategory 
      ? PROPHECY_DATABASE[selectedCategory]?.prophecies || []
      : allProphecies;
    
    if (searchQuery) {
      filtered = filtered.filter((prophecy) => 
        prophecy.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prophecy.scripture_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prophecy.scripture_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery, allProphecies]);

  const categories = Object.keys(PROPHECY_DATABASE);
  const totalCount = allProphecies.length;
  const selectedCategoryInfo = selectedCategory ? PROPHECY_DATABASE[selectedCategory] : null;

  return (
    <MainLayout title="Prophecy Codex" subtitle="Biblical References & Celestial Correlations">
      {/* Celestial Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {starPositions.map((pos, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute h-1 w-1 rounded-full bg-cyan-300"
            style={{ 
              top: `${pos.top}%`, 
              left: `${pos.left}%`,
              boxShadow: '0 0 4px 1px rgba(103, 232, 249, 0.5)'
            }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 2 + pos.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}

        <motion.div
          className="absolute top-20 right-20 h-96 w-96 rounded-full bg-linear-to-br from-purple-600/20 to-pink-600/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-40 left-40 h-80 w-80 rounded-full bg-linear-to-br from-blue-600/20 to-cyan-600/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="relative z-10 grid h-[calc(100vh-4rem)] grid-cols-12 gap-6 p-6">
        {/* Left Sidebar */}
        <motion.div 
          className="col-span-3 space-y-4 overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-lg border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-4 backdrop-blur-xl shadow-xl shadow-cyan-500/10">
            <h3 className="mb-4 text-lg font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              <BookOpenIcon className="inline-block h-5 w-5 mr-2 text-cyan-400" />
              Categories
            </h3>
            <div className="space-y-2">
              <motion.button
                onClick={() => setSelectedCategory(undefined)}
                className={`group w-full rounded-lg px-3 py-3 text-left text-sm transition-all ${
                  selectedCategory === undefined
                    ? 'bg-linear-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 shadow-lg shadow-cyan-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-cyan-300'
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <SparklesIcon className="inline-block h-4 w-4 mr-2" />
                All Prophecies
                <span className="block text-xs text-zinc-500 mt-1 group-hover:text-cyan-400/70">
                  {totalCount} prophecies
                </span>
              </motion.button>
              
              {categories.map((category, index) => {
                const catInfo = PROPHECY_DATABASE[category];
                return (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group w-full rounded-lg px-3 py-3 text-left text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-linear-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 shadow-lg shadow-cyan-500/20'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-cyan-300'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium">{category}</div>
                    <div className="text-xs text-zinc-500 mt-1 group-hover:text-cyan-400/70">
                      {catInfo.keyVerse.reference}
                    </div>
                    {selectedCategory === category && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 pt-2 border-t border-cyan-500/20 text-xs text-cyan-300/70 italic"
                      >
                        "{catInfo.keyVerse.text}"
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <motion.div 
            className="rounded-lg border border-purple-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-4 backdrop-blur-xl shadow-xl shadow-purple-500/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-3 text-sm font-semibold text-purple-300">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Prophecies:</span>
                <span className="font-bold text-cyan-400">{totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Filtered:</span>
                <span className="font-bold text-blue-400">{filteredProphecies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Categories:</span>
                <span className="font-bold text-purple-400">{categories.length}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="col-span-9 flex flex-col space-y-4 overflow-hidden">
          <motion.div 
            className="rounded-lg border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-4 backdrop-blur-xl shadow-xl shadow-cyan-500/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search prophecies, references, or text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpenIcon className="inline-block h-4 w-4 mr-1" />
                  List
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('timeline')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ClockIcon className="inline-block h-4 w-4 mr-1" />
                  Timeline
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('correlations')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    viewMode === 'correlations'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LinkIcon className="inline-block h-4 w-4 mr-1" />
                  Correlations
                </motion.button>
              </div>
            </div>

            {selectedCategoryInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-cyan-500/20"
              >
                <p className="text-sm text-cyan-300/80 italic">
                  {selectedCategoryInfo.description}
                </p>
              </motion.div>
            )}
          </motion.div>

          <div className="flex-1 overflow-y-auto rounded-lg border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-xl shadow-cyan-500/10">
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredProphecies.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-20 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <BookOpenIcon className="h-16 w-16 text-zinc-700 mb-4" />
                    <p className="text-zinc-400">No prophecies found matching your search.</p>
                  </motion.div>
                ) : (
                  filteredProphecies.map((prophecy, index) => (
                    <motion.div
                      key={prophecy.id}
                      className="group cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-cyan-500/40 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-cyan-500/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      onClick={() => setSelectedProphecy(prophecy)}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="text-lg font-semibold text-cyan-100 group-hover:text-cyan-300 transition-colors">
                          {prophecy.event_name}
                        </h4>
                        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                          {prophecy.prophecy_category}
                        </span>
                      </div>
                      <p className="mb-3 text-sm font-medium text-blue-400">
                        {prophecy.scripture_reference}
                      </p>
                      <p className="text-sm leading-relaxed text-zinc-300 line-clamp-3">
                        {prophecy.scripture_text}
                      </p>
                      {prophecy.related_events && prophecy.related_events.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {prophecy.related_events.map((event) => (
                            <span
                              key={event}
                              className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400 border border-cyan-500/20"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="relative pl-8">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-500 via-purple-500 to-pink-500" />
                {filteredProphecies.map((prophecy, index) => (
                  <motion.div
                    key={prophecy.id}
                    className="relative mb-8 pl-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-cyan-400 bg-zinc-900" />
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-cyan-500/40 transition-all">
                      <h4 className="mb-2 text-lg font-semibold text-cyan-100">
                        {prophecy.event_name}
                      </h4>
                      <p className="mb-2 text-sm font-medium text-blue-400">
                        {prophecy.scripture_reference}
                      </p>
                      <p className="text-sm text-zinc-300">{prophecy.scripture_text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'correlations' && (
              <div className="text-center py-20">
                <LinkIcon className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                  Celestial Correlations
                </h3>
                <p className="text-zinc-400">
                  Advanced correlation analysis coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProphecy && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedProphecy(null)}
        >
          <motion.div
            className="max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-xl border border-cyan-500/30 bg-linear-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl shadow-cyan-500/20"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedProphecy.event_name}
              </h2>
              <button
                onClick={() => setSelectedProphecy(null)}
                className="text-zinc-400 hover:text-cyan-300 transition-colors"
                aria-label="Close prophecy details"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300">
                {selectedProphecy.prophecy_category}
              </span>
            </div>

            <div className="mb-6 rounded-lg bg-cyan-500/10 p-4 border border-cyan-500/20">
              <p className="font-semibold text-cyan-300 mb-2">
                {selectedProphecy.scripture_reference}
              </p>
              <p className="text-zinc-300 leading-relaxed">
                {selectedProphecy.scripture_text}
              </p>
            </div>

            {selectedProphecy.related_events && selectedProphecy.related_events.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Related Events</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProphecy.related_events.map((event: string) => (
                    <span
                      key={event}
                      className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-300 border border-cyan-500/30"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </MainLayout>
  );
}
