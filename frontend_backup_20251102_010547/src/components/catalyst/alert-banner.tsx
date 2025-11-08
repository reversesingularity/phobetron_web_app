/**
 * Inline Alert Component
 * 
 * A simple inline alert/banner component for displaying messages, warnings, and notifications.
 * This is different from the modal Alert/Dialog component.
 */

import clsx from 'clsx';
import type React from 'react';

const alertColors = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export function AlertBanner({
  color = 'blue',
  className,
  children,
}: {
  color?: keyof typeof alertColors;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'rounded-lg border p-4',
        alertColors[color],
        className
      )}
    >
      {children}
    </div>
  );
}
