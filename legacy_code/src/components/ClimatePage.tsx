import React, { useState } from 'react';
import { ArrowLeft, Thermometer, Droplets, Wind, Sun, CloudRain, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, RadialBarChart, RadialBar, Legend } from 'recharts';

interface ClimatePageProps {
  onBack: () => void;
}

export const ClimatePage: React.FC<ClimatePageProps> = ({ onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'rainfall'>('temperature');

  // Generate hourly data for today
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const baseTemp = 28;
    const tempVariation = Math.sin((i - 6) / 24 * Math.PI * 2) * 6;
    const temp = baseTemp + tempVariation;
    
    return {
      hour: `${i}:00`,
      temperature: temp,
      humidity: 65 + Math.sin(i / 12 * Math.PI) * 15,
      rainfall: i >= 14 && i <= 18 ? Math.random() * 5 : 0,
      feelsLike: temp + (65 + Math.sin(i / 12 * Math.PI) * 15) / 20,
    };
  });

  // Monthly climate data
  const monthlyData = [
    { month: 'Jan', temp: 24, rainfall: 2, humidity: 60 },
    { month: 'Feb', temp: 25, rainfall: 1, humidity: 58 },
    { month: 'Mar', temp: 27, rainfall: 0, humidity: 62 },
    { month: 'Apr', temp: 29, rainfall: 1, humidity: 65 },
    { month: 'May', temp: 31, rainfall: 15, humidity: 70 },
    { month: 'Jun', temp: 29, rainfall: 485, humidity: 82 },
    { month: 'Jul', temp: 28, rainfall: 868, humidity: 85 },
    { month: 'Aug', temp: 28, rainfall: 556, humidity: 84 },
    { month: 'Sep', temp: 28, rainfall: 306, humidity: 80 },
    { month: 'Oct', temp: 29, rainfall: 64, humidity: 72 },
    { month: 'Nov', temp: 28, rainfall: 13, humidity: 65 },
    { month: 'Dec', temp: 26, rainfall: 3, humidity: 62 },
  ];

  // Weekly forecast
  const weeklyForecast = [
    { day: 'Mon', high: 32, low: 26, rainfall: 0, condition: 'sunny' },
    { day: 'Tue', high: 31, low: 25, rainfall: 0, condition: 'sunny' },
    { day: 'Wed', high: 30, low: 25, rainfall: 5, condition: 'cloudy' },
    { day: 'Thu', high: 29, low: 24, rainfall: 15, condition: 'rainy' },
    { day: 'Fri', high: 28, low: 24, rainfall: 20, condition: 'rainy' },
    { day: 'Sat', high: 30, low: 25, rainfall: 5, condition: 'cloudy' },
    { day: 'Sun', high: 31, low: 26, rainfall: 0, condition: 'sunny' },
  ];

  // Radial data for current conditions
  const radialData = [
    { name: 'Temperature', value: 75, fill: '#f97316' },
    { name: 'Humidity', value: 68, fill: '#06b6d4' },
    { name: 'Comfort', value: 62, fill: '#22c55e' },
  ];

  // Climate extremes
  const extremes = {
    temperature: { record_high: 42, record_low: 12, avg_high: 32, avg_low: 24 },
    rainfall: { wettest_month: 868, driest_month: 0, annual_avg: 2314 },
  };

  const currentTemp = hourlyData[new Date().getHours()].temperature;
  const currentHumidity = hourlyData[new Date().getHours()].humidity;

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-400" />;
      default: return <Wind className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 overflow-hidden">
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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">Climate & Weather Analysis</h1>
                <p className="text-orange-200 text-sm">Real-time meteorological data for Mumbai</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
              <p className="text-orange-200 text-sm">Last Updated</p>
              <p className="text-white">Just now</p>
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
          {/* Current Conditions */}
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Current Conditions</h2>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
                  <Thermometer className="w-16 h-16 text-white" />
                </div>
                <div className="text-6xl text-white mb-2">{Math.round(currentTemp)}°C</div>
                <p className="text-orange-200">Feels like {Math.round(hourlyData[new Date().getHours()].feelsLike)}°C</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-cyan-300" />
                    <span className="text-orange-200 text-sm">Humidity</span>
                  </div>
                  <p className="text-white text-xl">{Math.round(currentHumidity)}%</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-teal-300" />
                    <span className="text-orange-200 text-sm">Wind Speed</span>
                  </div>
                  <p className="text-white text-xl">15 km/h</p>
                </div>
              </div>
            </div>

            {/* Comfort Index */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Comfort Metrics</h2>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="20%" 
                  outerRadius="90%" 
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Legend 
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: '12px', color: '#fff' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Climate Extremes */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-white">Climate Extremes</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-orange-200 text-sm mb-2">Temperature Records</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-300">Record High</span>
                      <span className="text-red-400">{extremes.temperature.record_high}°C</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-300">Record Low</span>
                      <span className="text-blue-400">{extremes.temperature.record_low}°C</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/20" />

                <div>
                  <p className="text-orange-200 text-sm mb-2">Rainfall Records</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-300">Wettest Month</span>
                      <span className="text-blue-400">{extremes.rainfall.wettest_month}mm</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-300">Annual Average</span>
                      <span className="text-white">{extremes.rainfall.annual_avg}mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metric Selector */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMetric('temperature')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                    selectedMetric === 'temperature'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white/10 text-orange-200 hover:bg-white/20'
                  }`}
                >
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </button>
                <button
                  onClick={() => setSelectedMetric('humidity')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                    selectedMetric === 'humidity'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-white/10 text-orange-200 hover:bg-white/20'
                  }`}
                >
                  <Droplets className="w-4 h-4" />
                  <span>Humidity</span>
                </button>
                <button
                  onClick={() => setSelectedMetric('rainfall')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                    selectedMetric === 'rainfall'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-white/10 text-orange-200 hover:bg-white/20'
                  }`}
                >
                  <CloudRain className="w-4 h-4" />
                  <span>Rainfall</span>
                </button>
              </div>
            </div>

            {/* 24-Hour Trend */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">24-Hour {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend</h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
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
                      border: '1px solid rgba(249, 115, 22, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric}
                    stroke={selectedMetric === 'temperature' ? '#f97316' : selectedMetric === 'humidity' ? '#06b6d4' : '#3b82f6'}
                    strokeWidth={2}
                    fill={selectedMetric === 'temperature' ? 'url(#colorTemp)' : 'url(#colorHumidity)'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Forecast */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">7-Day Forecast</h2>
              <div className="grid grid-cols-7 gap-3">
                {weeklyForecast.map((day) => (
                  <div key={day.day} className="bg-white/10 rounded-xl p-3 border border-white/20 text-center">
                    <p className="text-orange-200 text-sm mb-2">{day.day}</p>
                    <div className="flex justify-center mb-2">
                      {getConditionIcon(day.condition)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-white text-sm">{day.high}°</p>
                      <p className="text-orange-300 text-xs">{day.low}°</p>
                    </div>
                    {day.rainfall > 0 && (
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300 text-xs">{day.rainfall}mm</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Climate Patterns */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Annual Climate Pattern</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(249, 115, 22, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    name="Temperature"
                    dot={{ fill: '#f97316', r: 4 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="rainfall"
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Rainfall"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 text-xs justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-orange-500" />
                  <span className="text-orange-200">Temperature</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/30 border border-blue-500" />
                  <span className="text-blue-200">Rainfall</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
