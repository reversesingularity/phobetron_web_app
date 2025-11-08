/**
 * Card Component
 * 
 * A versatile card/panel component for displaying content in a contained area.
 * Perfect for event cards in Watchman's View and prophecy details.
 */

import clsx from 'clsx';
import type React from 'react';

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}) {
  return (
    <div
      className={clsx(
        'rounded-lg',
        {
          // Variants
          'bg-zinc-900': variant === 'default',
          'bg-zinc-900 border border-zinc-800': variant === 'bordered',
          'bg-zinc-900 border border-zinc-800 shadow-lg': variant === 'elevated',
          
          // Padding
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('border-b border-zinc-800 pb-4 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-100', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx('text-sm text-gray-300 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('border-t border-zinc-800 pt-4 mt-4', className)}>
      {children}
    </div>
  );
}
