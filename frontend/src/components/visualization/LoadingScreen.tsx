/**
 * Loading Screen Component for Solar System Visualization
 * 
 * Shows loading progress while textures and data are being fetched
 */

'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export default function LoadingScreen({ 
  isLoading, 
  progress = 0, 
  message = 'Loading Solar System...' 
}: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '20%', left: '30%' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '40%', left: '70%', animationDelay: '0.5s' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '60%', left: '20%', animationDelay: '1s' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '80%', left: '80%', animationDelay: '1.5s' }} />
        <div className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse" style={{ top: '50%', left: '50%' }} />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center space-y-6">
        {/* Logo/Title */}
        <div className="text-4xl font-bold text-white mb-8">
          <span className="text-yellow-400">Phobetron</span> Solar System
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            {/* Orbiting Planets Animation */}
            <div className="absolute inset-0 border-4 border-yellow-400/30 rounded-full" />
            <div className="absolute inset-2 border-4 border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-4 border-4 border-red-400/30 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-64 mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-blue-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-white/70">
              {progress}% Complete
            </div>
          </div>
        )}

        {/* Loading Message */}
        <div className="text-lg text-white/90">
          {message}{dots}
        </div>

        {/* Loading Steps */}
        <div className="text-sm text-white/60 space-y-1">
          <div className={progress >= 25 ? 'text-green-400' : ''}>
            {progress >= 25 ? '✓' : '○'} Loading planet textures
          </div>
          <div className={progress >= 50 ? 'text-green-400' : ''}>
            {progress >= 50 ? '✓' : '○'} Fetching ephemeris data
          </div>
          <div className={progress >= 75 ? 'text-green-400' : ''}>
            {progress >= 75 ? '✓' : '○'} Calculating orbital elements
          </div>
          <div className={progress >= 100 ? 'text-green-400' : ''}>
            {progress >= 100 ? '✓' : '○'} Initializing 3D scene
          </div>
        </div>

        {/* Hint Text */}
        <div className="text-xs text-white/40 mt-8">
          Preparing professional-grade astronomical visualization
        </div>
      </div>
    </div>
  );
}
