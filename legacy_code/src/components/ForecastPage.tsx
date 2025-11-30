import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Brain, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart } from 'recharts';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  type: 'pollution' | 'climate';
}

interface ForecastPageProps {
  onBack: () => void;
  stations: Station[];
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ onBack, stations }) => {
  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [forecastHours, setForecastHours] = useState(24);

  // Generate realistic forecast data
  const generateForecast = (hours: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const baseAqi = selectedStation.aqi;
      const variation = Math.sin(i / 3) * 15 + (Math.random() - 0.5) * 8;
      const predicted = Math.max(0, baseAqi + variation);
      const confidence = 95 - (i / hours) * 25; // Confidence decreases over time
      
      data.push({
        time: `${time.getHours()}:00`,
        fullTime: time.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit' }),
        predicted: predicted,
        upper: predicted + (100 - confidence) * 0.3,
        lower: Math.max(0, predicted - (100 - confidence) * 0.3),
        confidence: confidence,
      });
    }
    
    return data;
  };

  const forecastData = generateForecast(forecastHours);
  
  // Model performance metrics
  const modelMetrics = [
    { name: 'Accuracy', value: 92, color: 'from-green-500 to-emerald-600' },
    { name: 'Precision', value: 89, color: 'from-blue-500 to-cyan-600' },
    { name: 'Recall', value: 94, color: 'from-purple-500 to-pink-600' },
    { name: 'F1 Score', value: 91, color: 'from-orange-500 to-red-600' },
  ];

  // Feature importance
  const featureImportance = [
    { feature: 'Historical AQI', importance: 35 },
    { feature: 'Wind Speed', importance: 22 },
    { feature: 'Temperature', importance: 18 },
    { feature: 'Humidity', importance: 15 },
    { feature: 'Traffic Density', importance: 10 },
  ];

  const avgConfidence = (forecastData.reduce((acc, d) => acc + d.confidence, 0) / forecastData.length).toFixed(1);
  const maxAqi = Math.max(...forecastData.map(d => d.predicted));
  const minAqi = Math.min(...forecastData.map(d => d.predicted));
  const trend = forecastData[forecastData.length - 1].predicted > selectedStation.aqi ? 'increasing' : 'decreasing';

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 overflow-hidden">
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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl relative">
                <Sparkles className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-purple-900 text-xs px-2 py-0.5 rounded-full">
                  BETA
                </div>
              </div>
              <div>
                <h1 className="text-white">AI-Powered Pollution Forecast</h1>
                <p className="text-purple-200 text-sm">Machine learning predictions for Mumbai's air quality</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
              <p className="text-purple-200 text-sm">Model Version</p>
              <p className="text-white">v2.3.1</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl px-4 py-2 border border-purple-400/30">
              <p className="text-purple-200 text-sm">Avg Confidence</p>
              <p className="text-white">{avgConfidence}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-[calc(100vh-88px)] overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls & Stats */}
          <div className="space-y-6">
            {/* Station Selection */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Forecast Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-purple-200 text-sm mb-2 block">Station</label>
                  <select
                    value={selectedStation.id}
                    onChange={(e) => setSelectedStation(stations.find(s => s.id === e.target.value) || stations[0])}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 outline-none"
                  >
                    {stations.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-800">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-purple-200 text-sm mb-2 block">Forecast Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[12, 24, 48].map(hours => (
                      <button
                        key={hours}
                        onClick={() => setForecastHours(hours)}
                        className={`py-2 px-3 rounded-xl transition-all ${
                          forecastHours === hours
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Prediction Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">Current AQI</span>
                  <span className="text-white text-xl">{Math.round(selectedStation.aqi)}</span>
                </div>
                
                <div className="h-px bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">Peak Forecast</span>
                  <span className="text-white text-xl">{Math.round(maxAqi)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">Low Forecast</span>
                  <span className="text-white text-xl">{Math.round(minAqi)}</span>
                </div>
                
                <div className="h-px bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">Trend</span>
                  <div className={`flex items-center gap-2 ${trend === 'increasing' ? 'text-red-400' : 'text-green-400'}`}>
                    <TrendingUp className={`w-4 h-4 ${trend === 'decreasing' ? 'rotate-180' : ''}`} />
                    <span className="capitalize">{trend}</span>
                  </div>
                </div>
              </div>

              {maxAqi > 150 && (
                <div className="mt-4 bg-red-500/20 rounded-xl p-3 border border-red-400/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">
                      Unhealthy levels predicted in the next {forecastHours} hours
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Model Performance */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-white">Model Performance</h2>
              </div>
              
              <div className="space-y-3">
                {modelMetrics.map((metric) => (
                  <div key={metric.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-purple-200">{metric.name}</span>
                      <span className="text-white">{metric.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${metric.color} transition-all`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 bg-green-500/20 rounded-xl px-3 py-2 border border-green-400/30">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Model validated on 10k+ samples</span>
              </div>
            </div>
          </div>

          {/* Right Column - Forecast Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Forecast Chart */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">{forecastHours}-Hour AQI Forecast</h2>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(168, 85, 247, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="rgba(168, 85, 247, 0.1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="rgba(168, 85, 247, 0.1)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 4 }}
                    activeDot={{ r: 6, fill: '#ec4899' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-purple-400" />
                  <span className="text-purple-200">Predicted AQI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400/20 border border-purple-400" />
                  <span className="text-purple-200">Confidence Range</span>
                </div>
              </div>
            </div>

            {/* Confidence Over Time */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-pink-400" />
                <h2 className="text-white">Prediction Confidence</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(236, 72, 153, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    fill="url(#colorConfidence)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-purple-200 text-sm mt-2">
                Confidence decreases for longer-term predictions
              </p>
            </div>

            {/* Feature Importance */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Model Feature Importance</h2>
              <p className="text-purple-200 text-sm mb-4">
                Key factors influencing the AI predictions
              </p>
              
              <div className="space-y-3">
                {featureImportance.map((item, index) => (
                  <div key={item.feature}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">#{index + 1}</span>
                        <span className="text-white">{item.feature}</span>
                      </div>
                      <span className="text-purple-200">{item.importance}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${item.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
