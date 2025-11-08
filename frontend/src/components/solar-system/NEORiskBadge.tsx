/**
 * NEO Risk Badge Component
 * Displays collision risk assessment for Near-Earth Objects using Torino scale
 */

'use client';

import { Badge } from '@/components/catalyst/badge';
import { 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  BoltIcon 
} from '@heroicons/react/24/outline';
import { useNEORiskAssessment } from '@/lib/hooks/useMLPredictions';

interface NEORiskBadgeProps {
  neoName: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * Get Torino scale color and label
 * Torino Scale:
 * 0 = No hazard (white)
 * 1 = Normal (green)
 * 2-4 = Merits attention (yellow)
 * 5-7 = Threatening (orange)
 * 8-10 = Certain collision (red)
 */
function getTorinoScaleInfo(scale: number): { 
  color: 'zinc' | 'lime' | 'yellow' | 'orange' | 'red';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  if (scale === 0) {
    return {
      color: 'zinc',
      label: 'No Hazard',
      icon: ShieldCheckIcon
    };
  } else if (scale === 1) {
    return {
      color: 'lime',
      label: 'Normal',
      icon: ShieldCheckIcon
    };
  } else if (scale >= 2 && scale <= 4) {
    return {
      color: 'yellow',
      label: 'Attention',
      icon: ExclamationTriangleIcon
    };
  } else if (scale >= 5 && scale <= 7) {
    return {
      color: 'orange',
      label: 'Threatening',
      icon: BoltIcon
    };
  } else {
    return {
      color: 'red',
      label: 'Certain Collision',
      icon: BoltIcon
    };
  }
}

export function NEORiskBadge({ neoName, showDetails = false, className = '' }: NEORiskBadgeProps) {
  const { data: assessment, loading } = useNEORiskAssessment(neoName);

  if (loading) {
    return (
      <Badge color="zinc" className={className}>
        <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
        Analyzing...
      </Badge>
    );
  }

  if (!assessment) {
    return null;
  }

  const { color, label, icon: Icon } = getTorinoScaleInfo(assessment.torino_scale);

  if (showDetails) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Badge color={color} className="w-fit">
          <Icon className="h-3 w-3" />
          Torino {assessment.torino_scale} - {label}
        </Badge>
        
        <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3 text-xs">
          <div className="mb-2 font-semibold text-white">Risk Assessment</div>
          
          <div className="space-y-1 text-zinc-400">
            <div className="flex justify-between">
              <span>Collision Probability:</span>
              <span className="font-mono text-white">
                {(assessment.collision_probability * 100).toFixed(6)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Impact Energy:</span>
              <span className="font-mono text-white">
                {assessment.impact_energy_megatons.toFixed(1)} MT
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Palermo Scale:</span>
              <span className="font-mono text-white">
                {assessment.palermo_scale.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Closest Approach:</span>
              <span className="font-mono text-white">
                {assessment.closest_approach_km.toLocaleString()} km
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Time Until Approach:</span>
              <span className="font-mono text-white">
                {assessment.years_until_approach.toFixed(2)} years
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Orbital Stability:</span>
              <Badge 
                color={
                  assessment.orbital_stability === 'STABLE' ? 'lime' :
                  assessment.orbital_stability === 'PERTURBED' ? 'yellow' : 'red'
                }
                className="text-[10px]"
              >
                {assessment.orbital_stability}
              </Badge>
            </div>
          </div>
          
          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div className="mt-3 border-t border-zinc-800 pt-2">
              <div className="mb-1 text-[10px] font-semibold uppercase text-zinc-500">
                AI Recommendations
              </div>
              <ul className="space-y-1">
                {assessment.recommendations.slice(0, 2).map((rec, idx) => (
                  <li key={idx} className="text-[10px] text-zinc-400">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Badge color={color} className={className}>
      <Icon className="h-3 w-3" />
      T{assessment.torino_scale}
    </Badge>
  );
}

/**
 * NEO Risk Panel - Shows all NEO assessments
 */
interface NEORiskPanelProps {
  neoNames: string[];
  className?: string;
}

export function NEORiskPanel({ neoNames, className = '' }: NEORiskPanelProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <BoltIcon className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-bold text-white">NEO Risk Assessments</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {neoNames.map(name => (
          <div
            key={name}
            className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-white">{name}</h4>
            </div>
            
            <NEORiskBadge neoName={name} showDetails />
          </div>
        ))}
      </div>

      {/* Torino Scale Legend */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
        <h4 className="mb-3 text-sm font-semibold text-white">Torino Scale Legend</h4>
        
        <div className="grid gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Badge color="zinc" className="w-16 justify-center">0</Badge>
            <span className="text-zinc-400">No hazard (routine discovery)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge color="lime" className="w-16 justify-center">1</Badge>
            <span className="text-zinc-400">Normal (pass near Earth)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge color="yellow" className="w-16 justify-center">2-4</Badge>
            <span className="text-zinc-400">Merits attention by astronomers</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge color="orange" className="w-16 justify-center">5-7</Badge>
            <span className="text-zinc-400">Threatening (regional/global damage)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge color="red" className="w-16 justify-center">8-10</Badge>
            <span className="text-zinc-400">Certain collision (global catastrophe)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
