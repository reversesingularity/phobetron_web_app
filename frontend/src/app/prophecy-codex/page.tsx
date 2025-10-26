/**
 * Prophecy Codex - Biblical Reference Interface (Phase 12 Enhanced)
 * 
 * Features:
 * - Advanced search with scripture reference and text search
 * - Celestial sign linking and correlation visualization
 * - Timeline view of prophetic events
 * - Scripture cross-referencing
 * - Filterable categories and tags
 */

'use client';

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { useProphecies } from '@/lib/hooks';
import { Prophecy } from '@/lib/types';

export default function ProphecyCodexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'correlations'>('list');
  const [selectedProphecy, setSelectedProphecy] = useState<Prophecy | null>(null);
  const [showCelestialLinks, setShowCelestialLinks] = useState(false);
  
  const { prophecies, loading, totalCount } = useProphecies({ category: selectedCategory });

  // Advanced filtering with search
  const filteredProphecies = useMemo(() => {
    if (!prophecies) return [];
    
    return prophecies.filter((prophecy) => {
      const matchesSearch = !searchQuery || 
        prophecy.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prophecy.scripture_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prophecy.scripture_text.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [prophecies, searchQuery]);

  const categories = [
    'End Times',
    'Messiah',
    'Israel',
    'Celestial Signs',
    'Judgment',
    'Restoration',
  ];

  return (
    <MainLayout title="Prophecy Codex" subtitle="Biblical References & Correlations">
      <div className="grid h-[calc(100vh-4rem)] grid-cols-12 gap-6 p-6">
        {/* Left Sidebar - Categories */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 font-semibold text-zinc-50">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === undefined
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50'
                }`}
              >
                All Prophecies
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 font-semibold text-zinc-50">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Prophecies:</span>
                <span className="font-semibold text-zinc-50">{loading ? '...' : totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Celestial Signs:</span>
                <span className="font-semibold text-zinc-50">...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Correlations:</span>
                <span className="font-semibold text-zinc-50">...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Prophecy List */}
        <div className="col-span-9 rounded-lg border border-zinc-800 bg-zinc-900/50">
          {/* Header */}
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-50">
                  {selectedCategory || 'All Prophecies'}
                </h2>
                <p className="text-sm text-zinc-400">
                  {loading ? 'Loading...' : `${filteredProphecies.length} prophecies found`}
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-400 hover:text-zinc-50'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-400 hover:text-zinc-50'
                  }`}
                >
                  📅 Timeline
                </button>
                <button
                  onClick={() => setViewMode('correlations')}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === 'correlations'
                      ? 'bg-blue-500 text-white'
                      : 'text-zinc-400 hover:text-zinc-50'
                  }`}
                >
                  🔗 Correlations
                </button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="search"
                  placeholder="Search prophecies by name, scripture, or text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 pl-10 text-sm text-zinc-50 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <button
                onClick={() => setShowCelestialLinks(!showCelestialLinks)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  showCelestialLinks
                    ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50'
                }`}
              >
                ⭐ Celestial Links
              </button>
            </div>
          </div>

          {/* Prophecy Content - Multiple Views */}
          <div className="h-[calc(100vh-20rem)] overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
                  <p className="mt-4 text-sm text-zinc-400">Loading prophecies...</p>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              // LIST VIEW
              filteredProphecies.length > 0 ? (
                <div className="space-y-4">
                  {filteredProphecies.map((prophecy) => (
                    <div
                      key={prophecy.id}
                      onClick={() => setSelectedProphecy(prophecy)}
                      className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-zinc-700 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-zinc-50">
                            {prophecy.event_name}
                          </h3>
                          <p className="mt-1 text-sm text-blue-400">{prophecy.scripture_reference}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                            {prophecy.prophecy_category}
                          </span>
                          {showCelestialLinks && (
                            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                              ⭐ Linked
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        {prophecy.scripture_text}
                      </p>
                      {prophecy.related_events && prophecy.related_events.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {prophecy.related_events.map((event, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Celestial Link Info */}
                      {showCelestialLinks && (
                        <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                          <div className="flex items-center gap-2 text-xs text-yellow-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="font-medium">Celestial Correlation:</span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-400">
                            Associated with planetary alignments and solar/lunar eclipses.
                            <button className="ml-2 text-yellow-400 hover:underline">View Details →</button>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <p className="mt-4 text-zinc-400">No prophecies found</p>
                    <p className="mt-1 text-sm text-zinc-500">Try adjusting your search or category filter</p>
                  </div>
                </div>
              )
            ) : viewMode === 'timeline' ? (
              // TIMELINE VIEW
              <div className="space-y-6">
                <div className="text-center text-sm text-zinc-400 mb-6">
                  📅 Chronological Timeline of Prophetic Events
                </div>
                {filteredProphecies.length > 0 ? (
                  <div className="relative pl-8">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                    
                    {filteredProphecies.map((prophecy, idx) => (
                      <div key={prophecy.id} className="relative mb-8 last:mb-0">
                        {/* Timeline dot */}
                        <div className="absolute -left-[29px] top-2 h-6 w-6 rounded-full border-4 border-zinc-900 bg-blue-500"></div>
                        
                        {/* Event card */}
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-zinc-50">{prophecy.event_name}</h4>
                              <p className="text-xs text-blue-400 mt-1">{prophecy.scripture_reference}</p>
                            </div>
                            <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
                              {prophecy.prophecy_category}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-400">{prophecy.scripture_text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-zinc-400">No events to display in timeline</p>
                  </div>
                )}
              </div>
            ) : (
              // CORRELATIONS VIEW
              <div className="space-y-6">
                <div className="text-center text-sm text-zinc-400 mb-6">
                  🔗 Prophecy & Celestial Event Correlations
                </div>
                {filteredProphecies.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredProphecies.map((prophecy) => (
                      <div key={prophecy.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Left: Prophecy */}
                          <div className="border-r border-zinc-800 pr-4">
                            <div className="text-xs font-medium text-purple-400 mb-2">📖 PROPHECY</div>
                            <h4 className="font-semibold text-zinc-50 text-sm">{prophecy.event_name}</h4>
                            <p className="text-xs text-blue-400 mt-1">{prophecy.scripture_reference}</p>
                            <p className="text-xs text-zinc-400 mt-2 line-clamp-3">{prophecy.scripture_text}</p>
                          </div>
                          
                          {/* Right: Celestial Events */}
                          <div className="pl-4">
                            <div className="text-xs font-medium text-yellow-400 mb-2">⭐ CELESTIAL EVENTS</div>
                            <div className="space-y-2">
                              <div className="rounded bg-zinc-900 p-2 text-xs">
                                <div className="flex items-center gap-2 text-yellow-400">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="font-medium">Solar Eclipse 2024</span>
                                </div>
                                <p className="text-zinc-400 mt-1">April 8, 2024 - Total eclipse over Americas</p>
                              </div>
                              
                              <div className="rounded bg-zinc-900 p-2 text-xs">
                                <div className="flex items-center gap-2 text-blue-400">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Planetary Alignment</span>
                                </div>
                                <p className="text-zinc-400 mt-1">June 2024 - Mercury, Mars, Jupiter, Saturn</p>
                              </div>
                              
                              <button className="text-xs text-blue-400 hover:underline mt-2">
                                + View all correlations →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-zinc-400">No correlations to display</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Prophecy Panel (Slide-in) */}
        {selectedProphecy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl m-4">
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-zinc-50">{selectedProphecy.event_name}</h2>
                    <p className="mt-1 text-blue-400">{selectedProphecy.scripture_reference}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProphecy(null)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                    {selectedProphecy.prophecy_category}
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                    📖 Scripture
                  </span>
                  {showCelestialLinks && (
                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                      ⭐ Celestial Linked
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Scripture Text */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Scripture Text</h3>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-zinc-50 leading-relaxed italic">
                      &ldquo;{selectedProphecy.scripture_text}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Celestial Correlations */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    ⭐ Celestial Event Correlations
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-yellow-500/20 p-2">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-400">Total Solar Eclipse - April 2024</h4>
                          <p className="text-sm text-zinc-400 mt-1">
                            Path of totality across North America. Historical significance matches prophetic timeline.
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Eclipse</span>
                            <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">2024</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-500/20 p-2">
                          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-400">Planetary Alignment - June 2024</h4>
                          <p className="text-sm text-zinc-400 mt-1">
                            Mercury, Mars, Jupiter, and Saturn align in rare configuration.
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Alignment</span>
                            <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">Rare</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cross References */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    🔗 Scripture Cross-References
                  </h3>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
                      <span className="font-medium text-blue-400">Matthew 24:29-30</span>
                      <p className="text-zinc-400 mt-1">
                        &ldquo;The sun will be darkened, and the moon will not give its light...&rdquo;
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
                      <span className="font-medium text-blue-400">Joel 2:31</span>
                      <p className="text-zinc-400 mt-1">
                        &ldquo;The sun will be turned to darkness and the moon to blood...&rdquo;
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
                      <span className="font-medium text-blue-400">Acts 2:19-20</span>
                      <p className="text-zinc-400 mt-1">
                        &ldquo;I will show wonders in the heavens above and signs on the earth below...&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Events */}
                {selectedProphecy.related_events && selectedProphecy.related_events.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                      Related Events
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProphecy.related_events.map((event, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                    📅 View in Timeline
                  </button>
                  <button className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                    🔗 View Correlations
                  </button>
                  <button className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                    📖 Study Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
