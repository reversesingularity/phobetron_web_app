/**
 * Collapsible Panel Component
 * Reusable panel with collapse/expand functionality
 */

'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export function CollapsiblePanel({ 
  title, 
  children, 
  defaultCollapsed = false,
  className = ''
}: CollapsiblePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-xl ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-800/50"
      >
        <h3 className="font-semibold text-zinc-50 flex items-center gap-2">
          {title}
        </h3>
        <div className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-700/50 hover:text-white">
          {isCollapsed ? (
            <ChevronDownIcon className="h-5 w-5" />
          ) : (
            <ChevronUpIcon className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-zinc-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
