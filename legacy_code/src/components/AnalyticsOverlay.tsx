import React from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  type: 'pollution' | 'climate';
}

interface AnalyticsOverlayProps {
  station: Station;
  onClose: () => void;
}

export const AnalyticsOverlay: React.FC<AnalyticsOverlayProps> = ({ station, onClose }) => {
  // Mock forecast data
  const forecastData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    aqi: station.aqi + Math.sin(i / 3) * 20 + (Math.random() - 0.5) * 10,
    predicted: station.aqi + Math.sin(i / 3) * 25 + (Math.random() - 0.5) * 15,
  }));

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-500' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-400', bg: 'bg-orange-500' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-500' };
    return { label: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-500' };
  };

  const status = getAQIStatus(station.aqi);
  const trend = forecastData[23].predicted > station.aqi ? 'up' : 'down';
  const trendPercent = Math.abs(((forecastData[23].predicted - station.aqi) / station.aqi) * 100).toFixed(1);

  return (
    <div className="absolute right-6 top-24 bottom-24 z-40 w-full max-w-md">
      <div className="h-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-b border-white/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white">{station.name}</h2>
                <p className="text-teal-200 text-sm">Monitoring Station</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* AQI Gauge */}
          <div className="relative">
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-6xl text-white">{Math.round(station.aqi)}</span>
              <span className="text-2xl text-teal-200 ml-2">AQI</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 ${status.bg} rounded-full`} />
              <span className={`${status.color}`}>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trend Card */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white">24h Forecast Trend</h3>
              <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm">{trendPercent}%</span>
              </div>
            </div>
            <p className="text-teal-200 text-sm">
              {trend === 'up' 
                ? 'Air quality expected to worsen in the next 24 hours' 
                : 'Air quality expected to improve in the next 24 hours'}
            </p>
          </div>

          {/* Forecast Chart */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-white mb-4">AI Prediction Model</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  label={{ value: 'Hours', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#14b8a6" 
                  strokeWidth={2}
                  fill="url(#colorAqi)"
                  name="Current"
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorPredicted)"
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-teal-400" />
                <span className="text-teal-200">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-purple-400 border-t-2 border-dashed border-purple-400" />
                <span className="text-purple-200">AI Forecast</span>
              </div>
            </div>
          </div>

          {/* Comparative Stats */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-white mb-4">Comparative Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-teal-200 text-sm">vs. City Average</span>
                <span className="text-white">
                  {station.aqi > 120 ? '+23%' : '-12%'} 
                  <span className={station.aqi > 120 ? 'text-red-400' : 'text-green-400'}>
                    {station.aqi > 120 ? ' worse' : ' better'}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-teal-200 text-sm">vs. Last Week</span>
                <span className="text-white">
                  +8% 
                  <span className="text-orange-400"> increased</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-teal-200 text-sm">Population Density</span>
                <span className="text-white">High (12k/km²)</span>
              </div>
            </div>
          </div>

          {/* Health Advisory */}
          {station.aqi > 100 && (
            <div className="bg-orange-500/20 rounded-2xl p-4 border border-orange-400/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-orange-300 mb-2">Health Advisory</h3>
                  <p className="text-orange-200 text-sm">
                    Sensitive groups should reduce prolonged outdoor exertion. 
                    Everyone else should limit prolonged outdoor activities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pollutant Breakdown */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-white mb-4">Pollutant Levels</h3>
            <div className="space-y-3">
              {[
                { name: 'PM2.5', value: 65, max: 100, color: 'bg-red-500' },
                { name: 'PM10', value: 85, max: 150, color: 'bg-orange-500' },
                { name: 'NO₂', value: 42, max: 100, color: 'bg-yellow-500' },
                { name: 'SO₂', value: 28, max: 80, color: 'bg-green-500' },
              ].map((pollutant) => (
                <div key={pollutant.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-teal-200">{pollutant.name}</span>
                    <span className="text-white">{pollutant.value} µg/m³</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${pollutant.color} transition-all`}
                      style={{ width: `${(pollutant.value / pollutant.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
