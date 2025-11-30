import React, { useState } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Button } from './ui/button';

export const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);

  const pollutants = [
    { id: 'pm25', label: 'PM2.5', color: 'bg-red-500' },
    { id: 'pm10', label: 'PM10', color: 'bg-orange-500' },
    { id: 'co', label: 'CO', color: 'bg-yellow-500' },
    { id: 'no2', label: 'NO₂', color: 'bg-blue-500' },
    { id: 'so2', label: 'SO₂', color: 'bg-purple-500' },
    { id: 'o3', label: 'O₃', color: 'bg-green-500' },
  ];

  const suggestions = [
    'Worli',
    'Andheri',
    'Bandra',
    'Colaba',
    'Powai',
    'Dadar',
  ];

  const filteredSuggestions = searchQuery
    ? suggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-6">
      {/* Main Search Bar */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <Search className="w-5 h-5 text-teal-300" />
          <input
            type="text"
            placeholder="Search locations, stations, or areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-teal-200/50 outline-none"
          />
          
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="h-8 w-8 text-teal-300 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="h-6 w-px bg-white/20" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 w-8 rounded-lg transition-all ${
              showFilters 
                ? 'bg-teal-500 text-white' 
                : 'text-teal-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-white/20 p-4 bg-black/20">
            <p className="text-teal-100 text-sm mb-3">Filter by Pollutant</p>
            <div className="flex flex-wrap gap-2">
              {pollutants.map((pollutant) => (
                <button
                  key={pollutant.id}
                  onClick={() => setSelectedPollutant(
                    selectedPollutant === pollutant.id ? null : pollutant.id
                  )}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    selectedPollutant === pollutant.id
                      ? `${pollutant.color} text-white shadow-lg scale-105`
                      : 'bg-white/10 text-teal-100 hover:bg-white/20'
                  }`}
                >
                  {pollutant.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {searchQuery && filteredSuggestions.length > 0 && (
          <div className="border-t border-white/20 bg-black/20">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(suggestion);
                  // Handle location selection
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors group"
              >
                <MapPin className="w-4 h-4 text-teal-300 group-hover:text-white" />
                <span className="text-white">{suggestion}</span>
                <span className="ml-auto text-teal-200 text-sm">Station</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Badge */}
      {selectedPollutant && (
        <div className="mt-3 flex items-center gap-2">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20 shadow-xl flex items-center gap-2">
            <span className="text-teal-100 text-sm">Active filter:</span>
            <span className="text-white">
              {pollutants.find(p => p.id === selectedPollutant)?.label}
            </span>
            <button
              onClick={() => setSelectedPollutant(null)}
              className="ml-2 text-teal-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
