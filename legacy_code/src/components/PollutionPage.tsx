import React, { useState } from 'react';
import { ArrowLeft, Cloud, Wind, Droplets, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  type: 'pollution' | 'climate';
}

interface PollutionPageProps {
  onBack: () => void;
  stations: Station[];
}

export const PollutionPage: React.FC<PollutionPageProps> = ({ onBack, stations }) => {
  const [selectedStation, setSelectedStation] = useState(stations[0]);

  // Mock data for charts
  const pollutantData = [
    { name: 'PM2.5', value: 65, safe: 35, color: '#ef4444' },
    { name: 'PM10', value: 85, safe: 50, color: '#f97316' },
    { name: 'NO₂', value: 42, safe: 40, color: '#eab308' },
    { name: 'SO₂', value: 28, safe: 20, color: '#22c55e' },
    { name: 'CO', value: 1.2, safe: 4, color: '#06b6d4' },
    { name: 'O₃', value: 68, safe: 100, color: '#8b5cf6' },
  ];

  const radarData = pollutantData.map(p => ({
    pollutant: p.name,
    current: p.value,
    safe: p.safe,
  }));

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    aqi: selectedStation.aqi + Math.sin(i / 3) * 20 + (Math.random() - 0.5) * 10,
  }));

  const cityAverageData = stations.map(s => ({
    name: s.name,
    aqi: s.aqi,
  })).sort((a, b) => b.aqi - a.aqi);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#a855f7';
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">Live Pollution Monitoring</h1>
                <p className="text-teal-200 text-sm">Real-time air quality data across Mumbai</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
              <p className="text-teal-200 text-sm">Last Updated</p>
              <p className="text-white">2 minutes ago</p>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-xl rounded-xl px-4 py-2 border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-[calc(100vh-88px)] overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main AQI Display */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white">Current AQI</h2>
                <select
                  value={selectedStation.id}
                  onChange={(e) => setSelectedStation(stations.find(s => s.id === e.target.value) || stations[0])}
                  className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 outline-none"
                >
                  {stations.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-800">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center mb-6">
                <div 
                  className="inline-flex items-center justify-center w-48 h-48 rounded-full mb-4"
                  style={{
                    background: `conic-gradient(${getAQIColor(selectedStation.aqi)} ${selectedStation.aqi * 1.8}deg, rgba(255,255,255,0.1) 0deg)`
                  }}
                >
                  <div className="w-40 h-40 bg-slate-900 rounded-full flex items-center justify-center">
                    <div>
                      <div className="text-6xl text-white mb-1">{Math.round(selectedStation.aqi)}</div>
                      <div className="text-teal-200">AQI</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getAQIColor(selectedStation.aqi) }}
                  />
                  <span className="text-white">
                    {selectedStation.aqi <= 50 ? 'Good' : selectedStation.aqi <= 100 ? 'Moderate' : selectedStation.aqi <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-teal-300" />
                    <span className="text-teal-200 text-sm">Wind Speed</span>
                  </div>
                  <p className="text-white text-xl">12 km/h</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-300" />
                    <span className="text-teal-200 text-sm">Humidity</span>
                  </div>
                  <p className="text-white text-xl">68%</p>
                </div>
              </div>

              {/* Health Advisory */}
              {selectedStation.aqi > 100 && (
                <div className="mt-4 bg-orange-500/20 rounded-xl p-4 border border-orange-400/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-orange-300 mb-1">Health Advisory</h3>
                      <p className="text-orange-200 text-sm">
                        Sensitive groups should avoid prolonged outdoor exposure
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* 24-Hour Trend */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">24-Hour AQI Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
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
                  <Bar 
                    dataKey="aqi" 
                    fill="#14b8a6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pollutant Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pollutant Levels */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <h2 className="text-white mb-4">Pollutant Levels</h2>
                <div className="space-y-4">
                  {pollutantData.map((pollutant) => (
                    <div key={pollutant.name}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-teal-200">{pollutant.name}</span>
                        <span className="text-white">{pollutant.value} µg/m³</span>
                      </div>
                      <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all rounded-full"
                          style={{ 
                            width: `${Math.min((pollutant.value / pollutant.safe) * 100, 100)}%`,
                            backgroundColor: pollutant.color
                          }}
                        />
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                          style={{ left: '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <h2 className="text-white mb-4">Pollutant Comparison</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis 
                      dataKey="pollutant" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                    />
                    <Radar 
                      name="Current" 
                      dataKey="current" 
                      stroke="#14b8a6" 
                      fill="#14b8a6" 
                      fillOpacity={0.5}
                    />
                    <Radar 
                      name="Safe Limit" 
                      dataKey="safe" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* City-wide Comparison */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Station Rankings</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cityAverageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="aqi" 
                    fill="#14b8a6"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
