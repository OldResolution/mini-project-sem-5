import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';

interface TimelineScrubberProps {
  value: number;
  onChange: (value: number) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({ value, onChange }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const getTimeLabel = (val: number) => {
    if (val < 33) {
      const hoursAgo = Math.floor((33 - val) * 24 / 33);
      return `${hoursAgo}h ago`;
    } else if (val === 50) {
      return 'Live Now';
    } else {
      const hoursAhead = Math.floor((val - 50) * 24 / 50);
      return `+${hoursAhead}h forecast`;
    }
  };

  const getTimeDescription = (val: number) => {
    if (val < 33) return 'Historical Data';
    if (val >= 33 && val <= 66) return 'Real-time';
    return 'AI Prediction';
  };

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        onChange(Math.min(value + 1, 100));
        if (value >= 100) setIsPlaying(false);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isPlaying, value, onChange]);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white">{getTimeLabel(value)}</p>
              <p className="text-teal-200 text-sm">{getTimeDescription(value)}</p>
            </div>
          </div>

          {/* Date Display */}
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-teal-300" />
            <span className="text-white text-sm">Nov 28, 2025</span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="relative mb-4">
          {/* Slider */}
          <Slider
            value={[value]}
            onValueChange={([val]) => onChange(val)}
            max={100}
            step={1}
            className="w-full"
          />

          {/* Timeline Markers */}
          <div className="flex justify-between mt-3 px-1">
            <div className="text-center">
              <div className="w-px h-2 bg-teal-400 mx-auto mb-1" />
              <span className="text-xs text-teal-200">24h ago</span>
            </div>
            <div className="text-center">
              <div className="w-px h-3 bg-white mx-auto mb-1" />
              <span className="text-xs text-white">Live</span>
            </div>
            <div className="text-center">
              <div className="w-px h-2 bg-purple-400 mx-auto mb-1" />
              <span className="text-xs text-purple-200">+24h</span>
            </div>
          </div>

          {/* Zone Indicators */}
          <div className="absolute top-2 left-0 right-0 h-1 rounded-full overflow-hidden -z-10">
            <div className="absolute left-0 w-1/3 h-full bg-gradient-to-r from-blue-500/30 to-teal-500/30" />
            <div className="absolute left-1/3 w-1/3 h-full bg-teal-500/30" />
            <div className="absolute right-0 w-1/3 h-full bg-gradient-to-r from-purple-500/30 to-pink-500/30" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange(Math.max(value - 5, 0))}
            className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 shadow-lg"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange(Math.min(value + 5, 100))}
            className="h-9 w-9 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Quick Jump Buttons */}
          <Button
            variant="ghost"
            onClick={() => onChange(0)}
            className="h-9 px-4 rounded-xl bg-white/10 text-teal-200 hover:bg-white/20 hover:text-white border border-white/20 text-sm"
          >
            24h ago
          </Button>

          <Button
            variant="ghost"
            onClick={() => onChange(50)}
            className="h-9 px-4 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 text-sm"
          >
            Live
          </Button>

          <Button
            variant="ghost"
            onClick={() => onChange(100)}
            className="h-9 px-4 rounded-xl bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white border border-white/20 text-sm"
          >
            +24h
          </Button>
        </div>

        {/* Forecast Badge */}
        {value > 66 && (
          <div className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl px-4 py-2 border border-purple-400/30">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-200 text-sm">AI-Powered Prediction Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
