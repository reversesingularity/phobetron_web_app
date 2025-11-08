'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'earthquake' | 'celestial' | 'feast' | 'correlation';
  title: string;
  magnitude?: number;
  significance: number;
  location?: string;
  description: string;
  feast_alignment?: boolean;
  correlations?: string[];
}

interface EventDataTableProps {
  events: TimelineEvent[];
  onEventClick: (eventId: string) => void;
  highlightedEventId: string | null;
}

type SortField = 'date' | 'type' | 'title' | 'significance' | 'magnitude';
type SortDirection = 'asc' | 'desc';

export default function EventDataTable({ 
  events, 
  onEventClick, 
  highlightedEventId 
}: EventDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Type color mapping
  const typeColors: Record<string, string> = {
    earthquake: 'bg-red-500/20 text-red-400 border-red-500/30',
    celestial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    feast: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    correlation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date objects
      if (sortField === 'date') {
        aValue = a.date.getTime();
        bValue = b.date.getTime();
      }

      // Handle missing values
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [events, searchTerm, typeFilter, sortField, sortDirection]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Significance', 'Magnitude', 'Location', 'Description', 'Feast Alignment'];
    const rows = filteredAndSortedEvents.map(event => [
      event.date.toISOString().split('T')[0],
      event.type,
      event.title,
      event.significance.toFixed(2),
      event.magnitude?.toFixed(1) || 'N/A',
      event.location || 'N/A',
      `"${event.description.replace(/"/g, '""')}"`, // Escape quotes
      event.feast_alignment ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pattern-events-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Event Data Table
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              {filteredAndSortedEvents.length} of {events.length} events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 transition-colors border border-zinc-700/50"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors border border-blue-500/30"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 pt-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Types</option>
                  <option value="earthquake">Atmospheric Events</option>
                  <option value="celestial">Celestial Events</option>
                  <option value="feast">Hebrew Feast Days</option>
                  <option value="correlation">Correlations</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800/50">
            <tr>
              <th 
                onClick={() => handleSort('date')}
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                onClick={() => handleSort('type')}
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
              >
                Type {getSortIcon('type')}
              </th>
              <th 
                onClick={() => handleSort('title')}
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
              >
                Title {getSortIcon('title')}
              </th>
              <th 
                onClick={() => handleSort('significance')}
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
              >
                Significance {getSortIcon('significance')}
              </th>
              <th 
                onClick={() => handleSort('magnitude')}
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
              >
                Magnitude {getSortIcon('magnitude')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Feast
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredAndSortedEvents.map((event, index) => (
              <motion.tr
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onEventClick(event.id)}
                className={`cursor-pointer transition-all hover:bg-zinc-800/50 ${
                  highlightedEventId === event.id 
                    ? 'bg-cyan-500/10 border-l-4 border-cyan-500' 
                    : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-300 font-medium">
                  {event.date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColors[event.type]}`}>
                    {event.type === 'earthquake' ? 'Atmospheric' : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-200 font-medium">
                  {event.title}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${event.significance * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400">
                      {(event.significance * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-300">
                  {event.magnitude ? (
                    <span className="font-semibold">M{event.magnitude.toFixed(1)}</span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {event.location || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400 max-w-md truncate">
                  {event.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {event.feast_alignment ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      ✓
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedEvents.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-zinc-500">No events match your filters</p>
        </div>
      )}
    </motion.div>
  );
}
