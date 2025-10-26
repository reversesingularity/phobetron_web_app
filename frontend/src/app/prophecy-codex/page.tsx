/**
 * Prophecy Codex - Biblical Reference Interface
 * 
 * Searchable database of biblical prophecies with correlations
 * to celestial signs and astronomical events.
 */

'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useProphecies } from '@/lib/hooks';

export default function ProphecyCodexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { prophecies, loading, totalCount } = useProphecies({ category: selectedCategory });

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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-50">
                  {selectedCategory || 'All Prophecies'}
                </h2>
                <p className="text-sm text-zinc-400">
                  {loading ? 'Loading...' : `${prophecies ? prophecies.length : 0} prophecies found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  placeholder="Search prophecies..."
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Prophecy List */}
          <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
                  <p className="mt-4 text-sm text-zinc-400">Loading prophecies...</p>
                </div>
              </div>
            ) : prophecies && prophecies.length > 0 ? (
              <div className="space-y-4">
                {prophecies.map((prophecy) => (
                  <div
                    key={prophecy.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-zinc-50">
                          {prophecy.event_name}
                        </h3>
                        <p className="mt-1 text-sm text-blue-400">{prophecy.scripture_reference}</p>
                      </div>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                        {prophecy.prophecy_category}
                      </span>
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
                  <p className="mt-1 text-sm text-zinc-500">Try selecting a different category</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
