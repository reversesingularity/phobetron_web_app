import { X, Globe, Scale, Clock, Flame } from 'lucide-react';
import type { PlanetInfo } from '../../lib/planetData';

interface PlanetInfoPanelProps {
  planet: PlanetInfo;
  onClose: () => void;
}

export default function PlanetInfoPanel({ planet, onClose }: PlanetInfoPanelProps) {
  return (
    <div className="fixed right-4 top-20 bottom-4 w-96 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col">
      {/* Header */}
      <div 
        className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between"
        style={{ backgroundColor: `${planet.color}15` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: planet.color }}
          />
          <h2 className="text-2xl font-bold text-white">{planet.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Close panel"
        >
          <X className="w-6 h-6 text-zinc-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${planet.color}20`,
              color: planet.color,
              border: `1px solid ${planet.color}40`
            }}
          >
            {planet.type} Planet
          </span>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Globe className="w-5 h-5" />}
            label="Diameter"
            value={planet.diameter}
            color={planet.color}
          />
          <StatCard
            icon={<Scale className="w-5 h-5" />}
            label="Mass"
            value={planet.mass}
            color={planet.color}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Orbital Period"
            value={planet.orbitalPeriod}
            color={planet.color}
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Temperature"
            value={planet.temperature}
            color={planet.color}
          />
        </div>

        {/* Detailed Info */}
        <div className="space-y-4">
          <InfoRow label="Distance from Sun" value={planet.distanceFromSun} />
          <InfoRow label="Rotation Period" value={planet.rotationPeriod} />
          <InfoRow label="Moons" value={planet.moons.toString()} />
          <InfoRow label="Composition" value={planet.composition} />
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* Interesting Facts */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Interesting Facts
          </h3>
          <ul className="space-y-2">
            {planet.facts.map((fact, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                <span 
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color }}
                />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/50">
        <p className="text-xs text-zinc-500 text-center">
          Data from NASA/JPL • Click elsewhere to close
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-2 mb-1.5" style={{ color }}>
        {icon}
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-white leading-tight">{value}</p>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-zinc-400 font-medium">{label}:</span>
      <span className="text-sm text-white text-right flex-1">{value}</span>
    </div>
  );
}
