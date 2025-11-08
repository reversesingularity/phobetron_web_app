/**
 * GlassCard - Glassmorphic card component for Catalyst UI
 * 
 * Provides beautiful glass-effect cards with various variants and hover states.
 */

import * as React from 'react';
import { clsx } from 'clsx';

export type GlassCardVariant = 
  | 'default'   // Neutral glass effect
  | 'cyan'      // Cyan/blue tinted glass
  | 'orange'    // Orange tinted glass
  | 'red'       // Red tinted glass
  | 'purple'    // Purple tinted glass
  | 'green';    // Green tinted glass

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  hover?: boolean; // Enable hover effects
  glow?: boolean;  // Enable glow effect
  neon?: boolean;  // Enable neon border effect
}

const variantStyles: Record<GlassCardVariant, string> = {
  default: clsx(
    'border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50',
    'hover:border-zinc-700/60 hover:from-zinc-900/60 hover:to-zinc-950/60'
  ),
  cyan: clsx(
    'border-cyan-900/40 bg-gradient-to-br from-cyan-950/30 to-zinc-950/50',
    'hover:border-cyan-700/50 hover:from-cyan-950/40 hover:to-zinc-900/60',
    'shadow-[0_0_20px_rgba(34,211,238,0.1)]'
  ),
  orange: clsx(
    'border-orange-900/40 bg-gradient-to-br from-orange-950/30 to-zinc-950/50',
    'hover:border-orange-700/50 hover:from-orange-950/40 hover:to-zinc-900/60',
    'shadow-[0_0_20px_rgba(249,115,22,0.1)]'
  ),
  red: clsx(
    'border-red-900/40 bg-gradient-to-br from-red-950/30 to-zinc-950/50',
    'hover:border-red-700/50 hover:from-red-950/40 hover:to-zinc-900/60',
    'shadow-[0_0_20px_rgba(239,68,68,0.1)]'
  ),
  purple: clsx(
    'border-purple-900/40 bg-gradient-to-br from-purple-950/30 to-zinc-950/50',
    'hover:border-purple-700/50 hover:from-purple-950/40 hover:to-zinc-900/60',
    'shadow-[0_0_20px_rgba(168,85,247,0.1)]'
  ),
  green: clsx(
    'border-green-900/40 bg-gradient-to-br from-green-950/30 to-zinc-950/50',
    'hover:border-green-700/50 hover:from-green-950/40 hover:to-zinc-900/60',
    'shadow-[0_0_20px_rgba(34,197,94,0.1)]'
  ),
};

const glowStyles: Record<GlassCardVariant, string> = {
  default: 'shadow-[0_0_30px_rgba(255,255,255,0.05)]',
  cyan: 'shadow-[0_0_30px_rgba(34,211,238,0.15),0_0_60px_rgba(34,211,238,0.08)]',
  orange: 'shadow-[0_0_30px_rgba(249,115,22,0.15),0_0_60px_rgba(249,115,22,0.08)]',
  red: 'shadow-[0_0_30px_rgba(239,68,68,0.15),0_0_60px_rgba(239,68,68,0.08)]',
  purple: 'shadow-[0_0_30px_rgba(168,85,247,0.15),0_0_60px_rgba(168,85,247,0.08)]',
  green: 'shadow-[0_0_30px_rgba(34,197,94,0.15),0_0_60px_rgba(34,197,94,0.08)]',
};

const neonBorderStyles: Record<GlassCardVariant, string> = {
  default: '',
  cyan: 'before:absolute before:inset-0 before:rounded-2xl before:border before:border-cyan-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
  orange: 'before:absolute before:inset-0 before:rounded-2xl before:border before:border-orange-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
  red: 'before:absolute before:inset-0 before:rounded-2xl before:border before:border-red-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
  purple: 'before:absolute before:inset-0 before:rounded-2xl before:border before:border-purple-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
  green: 'before:absolute before:inset-0 before:rounded-2xl before:border before:border-green-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
};

export function GlassCard({
  variant = 'default',
  hover = true,
  glow = false,
  neon = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        // Base styles
        'relative rounded-2xl border backdrop-blur-xl',
        
        // Variant styles
        variantStyles[variant],
        
        // Glow effect
        glow && glowStyles[variant],
        
        // Neon border effect
        neon && neonBorderStyles[variant],
        
        // Hover transform
        hover && 'transition-all duration-300 hover:scale-[1.02]',
        
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('mb-4 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCardItem({
  variant = 'default',
  hover = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  const itemVariantStyles: Record<GlassCardVariant, string> = {
    default: 'border-zinc-800/50 bg-zinc-950/50 hover:bg-zinc-900/50 hover:border-zinc-700/50',
    cyan: 'border-cyan-900/30 bg-zinc-950/50 hover:bg-cyan-950/20 hover:border-cyan-500/50',
    orange: 'border-orange-900/30 bg-zinc-950/50 hover:bg-orange-950/20 hover:border-orange-500/50',
    red: 'border-red-900/30 bg-zinc-950/50 hover:bg-red-950/20 hover:border-red-500/50',
    purple: 'border-purple-900/30 bg-zinc-950/50 hover:bg-purple-950/20 hover:border-purple-500/50',
    green: 'border-green-900/30 bg-zinc-950/50 hover:bg-green-950/20 hover:border-green-500/50',
  };

  return (
    <div
      className={clsx(
        'group rounded-lg border p-3',
        itemVariantStyles[variant],
        hover && 'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardEmpty({
  icon,
  title,
  description,
  details,
  variant = 'default',
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  details?: React.ReactNode;
  variant?: GlassCardVariant;
  className?: string;
}) {
  const iconBgStyles: Record<GlassCardVariant, string> = {
    default: 'bg-zinc-950/50',
    cyan: 'bg-cyan-950/50',
    orange: 'bg-orange-950/50',
    red: 'bg-red-950/50',
    purple: 'bg-purple-950/50',
    green: 'bg-green-950/50',
  };

  const iconColorStyles: Record<GlassCardVariant, string> = {
    default: 'text-zinc-500',
    cyan: 'text-cyan-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
  };

  return (
    <div className={clsx('py-8 text-center', className)}>
      {icon && (
        <div className={clsx(
          'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full',
          iconBgStyles[variant]
        )}>
          <div className={iconColorStyles[variant]}>
            {icon}
          </div>
        </div>
      )}
      <p className="text-zinc-400">{title}</p>
      {description && (
        <p className="mt-2 text-xs text-zinc-600">{description}</p>
      )}
      {details && (
        <div className="mt-3">{details}</div>
      )}
    </div>
  );
}
