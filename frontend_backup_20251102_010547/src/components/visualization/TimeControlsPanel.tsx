'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid';

interface TimeControlsPanelProps {
  currentTime: number;
  isPaused: boolean;
  speedMultiplier: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onTimeJump: (milliseconds: number) => void;
  onDateChange: (date: Date) => void;
}

export default function TimeControlsPanel({
  currentTime,
  isPaused,
  speedMultiplier,
  onPlayPause,
  onSpeedChange,
  onTimeJump,
  onDateChange,
}: TimeControlsPanelProps) {
  const [showSpeedInput, setShowSpeedInput] = useState(false);
  const [customSpeed, setCustomSpeed] = useState(speedMultiplier.toString());
  const [dateTimeValue, setDateTimeValue] = useState('');

  // Set initial datetime value after mount to prevent hydration mismatch
  useEffect(() => {
    setDateTimeValue(new Date(currentTime).toISOString().slice(0, 16));
  }, []);

  // Update datetime value when currentTime changes
  useEffect(() => {
    if (dateTimeValue) { // Only update if already initialized
      setDateTimeValue(new Date(currentTime).toISOString().slice(0, 16));
    }
  }, [currentTime]);

  // Format current time for display
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  };

  const { date, time } = formatDateTime(currentTime);

  // Preset speed options (memoized to prevent useEffect dependency changes)
  // 1x = realtime (1 real second = 1 simulated second)
  // Higher values = faster (e.g., 3600x = 1 simulated hour per real second)
  const speedPresets = useMemo(() => [0.1, 1, 24, 168, 720, 8760], []);

  // Time jump amounts (in milliseconds)
  const HOUR = 3600000;
  const DAY = 86400000;
  const WEEK = 604800000;

  // Handle custom speed input
  const handleCustomSpeedSubmit = () => {
    const speed = parseFloat(customSpeed);
    if (!isNaN(speed) && speed > 0 && speed <= 1000) {
      onSpeedChange(speed);
      setShowSpeedInput(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ': // Space - play/pause
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft': // Left arrow - step backward
          e.preventDefault();
          if (e.shiftKey) {
            onTimeJump(-DAY); // 1 day back
          } else {
            onTimeJump(-HOUR); // 1 hour back
          }
          break;
        case 'ArrowRight': // Right arrow - step forward
          e.preventDefault();
          if (e.shiftKey) {
            onTimeJump(DAY); // 1 day forward
          } else {
            onTimeJump(HOUR); // 1 hour forward
          }
          break;
        case 'ArrowUp': // Up arrow - increase speed
          e.preventDefault();
          const currentIndex = speedPresets.indexOf(speedMultiplier);
          if (currentIndex < speedPresets.length - 1) {
            onSpeedChange(speedPresets[currentIndex + 1]);
          }
          break;
        case 'ArrowDown': // Down arrow - decrease speed
          e.preventDefault();
          const currentIndexDown = speedPresets.indexOf(speedMultiplier);
          if (currentIndexDown > 0) {
            onSpeedChange(speedPresets[currentIndexDown - 1]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [speedMultiplier, speedPresets, onPlayPause, onSpeedChange, onTimeJump, HOUR, DAY]);

  // Handle date input change
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="fixed bottom-4 left-64 z-20 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg shadow-2xl p-4 w-96">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-300 mb-1">Time Controls</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">{date}</div>
            <div className="text-sm text-zinc-400">{time} UTC</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Speed</div>
            <div className="text-lg font-bold text-cyan-400">{speedMultiplier}x</div>
          </div>
        </div>
      </div>

      {/* Play/Pause and Time Step Controls */}
      <div className="flex items-center gap-2 mb-4">
        {/* Step backward 1 day */}
        <button
          onClick={() => onTimeJump(-DAY)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          title="Step back 1 day (Shift + ←)"
        >
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </button>

        {/* Step backward 1 hour */}
        <button
          onClick={() => onTimeJump(-HOUR)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          title="Step back 1 hour (←)"
        >
          <BackwardIcon className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className={`flex-1 p-3 rounded font-semibold transition-all ${
            isPaused
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
          title="Play/Pause (Space)"
        >
          <div className="flex items-center justify-center gap-2">
            {isPaused ? (
              <>
                <PlayIcon className="w-5 h-5" />
                <span>Play</span>
              </>
            ) : (
              <>
                <PauseIcon className="w-5 h-5" />
                <span>Pause</span>
              </>
            )}
          </div>
        </button>

        {/* Step forward 1 hour */}
        <button
          onClick={() => onTimeJump(HOUR)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          title="Step forward 1 hour (→)"
        >
          <ForwardIcon className="w-4 h-4" />
        </button>

        {/* Step forward 1 day */}
        <button
          onClick={() => onTimeJump(DAY)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          title="Step forward 1 day (Shift + →)"
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Quick jump buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onTimeJump(-WEEK)}
          className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors"
        >
          -1 Week
        </button>
        <button
          onClick={() => onDateChange(new Date())}
          className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors"
        >
          Now
        </button>
        <button
          onClick={() => onTimeJump(WEEK)}
          className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors"
        >
          +1 Week
        </button>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-zinc-400">Simulation Speed</label>
          <button
            onClick={() => setShowSpeedInput(!showSpeedInput)}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            Custom
          </button>
        </div>

        {showSpeedInput ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={customSpeed}
              onChange={(e) => setCustomSpeed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSpeedSubmit()}
              className="flex-1 px-3 py-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-cyan-500 focus:outline-none text-sm"
              placeholder="Speed (0.1-1000)"
              min="0.1"
              max="1000"
              step="0.1"
            />
            <button
              onClick={handleCustomSpeedSubmit}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
            >
              Set
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {speedPresets.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    speedMultiplier === speed
                      ? 'bg-cyan-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="text-xs text-zinc-500 text-center">
              {speedMultiplier === 1 && '1x = Realtime (24hrs/day)'}
              {speedMultiplier === 24 && '24x = 1 day/hour'}
              {speedMultiplier === 168 && '168x = 1 week/hour'}
              {speedMultiplier === 720 && '720x = 1 month/hour'}
              {speedMultiplier === 8760 && '8760x = 1 year/hour'}
              {speedMultiplier < 1 && `${speedMultiplier}x = Slow motion`}
              {speedMultiplier > 1 && speedMultiplier !== 24 && speedMultiplier !== 168 && speedMultiplier !== 720 && speedMultiplier !== 8760 && `${speedMultiplier}x accelerated`}
            </div>
          </>
        )}
      </div>

      {/* Date Picker */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">Jump to Date</label>
        <input
          type="datetime-local"
          value={dateTimeValue}
          onChange={handleDateInputChange}
          title="Select date and time"
          className="w-full px-3 py-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-cyan-500 focus:outline-none text-sm"
        />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500">
          <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
          <div className="grid grid-cols-2 gap-1">
            <div><kbd className="bg-zinc-800 px-1 rounded">Space</kbd> Play/Pause</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">←/→</kbd> Hour</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">Shift+←/→</kbd> Day</div>
            <div><kbd className="bg-zinc-800 px-1 rounded">↑/↓</kbd> Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
