import React, { useState } from 'react';
import { ArrowLeft, Users, TrendingUp, Home, Building2, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';

interface PopulationPageProps {
  onBack: () => void;
}

export const PopulationPage: React.FC<PopulationPageProps> = ({ onBack }) => {
  const [selectedWard, setSelectedWard] = useState('A');

  // Mumbai wards data
  const wardData = [
    { ward: 'A', name: 'Colaba', population: 89000, density: 22500, area: 4.0, growth: 2.3 },
    { ward: 'B', name: 'Malabar Hill', population: 75000, density: 18700, area: 4.0, growth: 1.8 },
    { ward: 'C', name: 'Kalbadevi', population: 125000, density: 31250, area: 4.0, growth: -0.5 },
    { ward: 'D', name: 'Girgaon', population: 98000, density: 24500, area: 4.0, growth: 0.2 },
    { ward: 'E', name: 'Byculla', population: 115000, density: 28750, area: 4.0, growth: 1.5 },
    { ward: 'F', name: 'Parel', population: 142000, density: 35500, area: 4.0, growth: 3.2 },
    { ward: 'G', name: 'Worli', population: 156000, density: 39000, area: 4.0, growth: 4.1 },
    { ward: 'H', name: 'Bandra', population: 178000, density: 44500, area: 4.0, growth: 3.8 },
    { ward: 'K', name: 'Andheri', population: 225000, density: 56250, area: 4.0, growth: 5.2 },
    { ward: 'L', name: 'Kurla', population: 198000, density: 49500, area: 4.0, growth: 4.5 },
    { ward: 'M', name: 'Chembur', population: 165000, density: 41250, area: 4.0, growth: 3.1 },
    { ward: 'N', name: 'Ghatkopar', population: 189000, density: 47250, area: 4.0, growth: 3.9 },
  ];

  const selectedWardData = wardData.find(w => w.ward === selectedWard) || wardData[0];

  // Age distribution
  const ageDistribution = [
    { age: '0-14', value: 23, color: '#06b6d4' },
    { age: '15-29', value: 28, color: '#14b8a6' },
    { age: '30-44', value: 25, color: '#22c55e' },
    { age: '45-59', value: 16, color: '#eab308' },
    { age: '60+', value: 8, color: '#f97316' },
  ];

  // Housing types
  const housingTypes = [
    { name: 'Apartments', value: 45, color: '#6366f1' },
    { name: 'Chawls', value: 25, color: '#8b5cf6' },
    { name: 'Slums', value: 20, color: '#ec4899' },
    { name: 'Bungalows', value: 7, color: '#06b6d4' },
    { name: 'Other', value: 3, color: '#64748b' },
  ];

  // Population vs Density scatter
  const scatterData = wardData.map(w => ({
    name: w.name,
    population: w.population / 1000,
    density: w.density / 1000,
    growth: w.growth,
  }));

  // Time series data
  const historicalData = [
    { year: 2010, population: 10.2 },
    { year: 2012, population: 10.8 },
    { year: 2014, population: 11.4 },
    { year: 2016, population: 12.1 },
    { year: 2018, population: 12.7 },
    { year: 2020, population: 13.2 },
    { year: 2022, population: 13.8 },
    { year: 2024, population: 14.3 },
  ];

  const getDensityCategory = (density: number) => {
    if (density < 15000) return { label: 'Low', color: 'text-green-400', bg: 'bg-green-500' };
    if (density < 30000) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    if (density < 45000) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500' };
    return { label: 'Very High', color: 'text-red-400', bg: 'bg-red-500' };
  };

  const densityCategory = getDensityCategory(selectedWardData.density);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
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
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">Population Density Analysis</h1>
                <p className="text-blue-200 text-sm">Demographic insights across Mumbai wards</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
              <p className="text-blue-200 text-sm">Total Population</p>
              <p className="text-white text-xl">14.3M</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20">
              <p className="text-blue-200 text-sm">Avg Density</p>
              <p className="text-white text-xl">20.7k/km²</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-[calc(100vh-88px)] overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ward Selection & Stats */}
          <div className="space-y-6">
            {/* Ward Selector */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Select Ward</h2>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 outline-none mb-4"
              >
                {wardData.map(w => (
                  <option key={w.ward} value={w.ward} className="bg-slate-800">
                    Ward {w.ward} - {w.name}
                  </option>
                ))}
              </select>

              {/* Current Ward Stats */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white text-xl">{selectedWardData.name}</h3>
                  </div>
                  <p className="text-blue-200 text-sm">Ward {selectedWardData.ward}</p>
                </div>

                <div className="h-px bg-white/20" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-blue-200 text-sm mb-1">Population</p>
                    <p className="text-white text-xl">{(selectedWardData.population / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-blue-200 text-sm mb-1">Area</p>
                    <p className="text-white text-xl">{selectedWardData.area} km²</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-4 border border-blue-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-200">Density</span>
                    <div className={`w-3 h-3 ${densityCategory.bg} rounded-full`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-3xl">{(selectedWardData.density / 1000).toFixed(1)}k</span>
                    <span className="text-blue-200">/km²</span>
                  </div>
                  <p className={`text-sm mt-1 ${densityCategory.color}`}>
                    {densityCategory.label} Density
                  </p>
                </div>

                <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20">
                  <span className="text-blue-200 text-sm">Annual Growth</span>
                  <div className={`flex items-center gap-1 ${selectedWardData.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp className={`w-4 h-4 ${selectedWardData.growth < 0 ? 'rotate-180' : ''}`} />
                    <span>{Math.abs(selectedWardData.growth)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Age Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ageDistribution.map((item) => (
                  <div key={item.age} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-blue-200 text-sm">{item.age}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Housing Types */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-blue-400" />
                <h2 className="text-white">Housing Distribution</h2>
              </div>
              <div className="space-y-3">
                {housingTypes.map((type) => (
                  <div key={type.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-blue-200">{type.name}</span>
                      <span className="text-white">{type.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${type.value}%`,
                          backgroundColor: type.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Population by Ward */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Population by Ward</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    label={{ value: 'Population (thousands)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [(value / 1000).toFixed(1) + 'k', 'Population']}
                  />
                  <Bar 
                    dataKey="population" 
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Density Scatter Plot */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Population vs Density Analysis</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    dataKey="population" 
                    name="Population" 
                    unit="k"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    label={{ value: 'Population (thousands)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="density" 
                    name="Density" 
                    unit="k/km²"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    label={{ value: 'Density (k/km²)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <ZAxis type="number" dataKey="growth" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Population') return value.toFixed(1) + 'k';
                      if (name === 'Density') return value.toFixed(1) + 'k/km²';
                      return value;
                    }}
                  />
                  <Scatter 
                    name="Wards" 
                    data={scatterData} 
                    fill="#6366f1"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-blue-200 text-sm mt-2">
                Bubble size represents growth rate
              </p>
            </div>

            {/* Historical Growth */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-white">Historical Population Growth</h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="year" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    label={{ value: 'Population (millions)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [value + 'M', 'Population']}
                  />
                  <Bar 
                    dataKey="population" 
                    fill="url(#colorPopulation)"
                    radius={[8, 8, 0, 0]}
                  >
                    <defs>
                      <linearGradient id="colorPopulation" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Density Rankings */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-white mb-4">Ward Density Rankings</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wardData.sort((a, b) => b.density - a.density)} layout="vertical">
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
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [(value / 1000).toFixed(1) + 'k/km²', 'Density']}
                  />
                  <Bar 
                    dataKey="density" 
                    fill="#6366f1"
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
