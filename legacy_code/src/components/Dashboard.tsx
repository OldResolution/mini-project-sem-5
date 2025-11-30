import React, { useState } from 'react';
import { MapBackground } from './MapBackground';
import { TopNavigation } from './TopNavigation';
import { FloatingSidebar } from './FloatingSidebar';
import { SearchBar } from './SearchBar';
import { TimelineScrubber } from './TimelineScrubber';
import { AnalyticsOverlay } from './AnalyticsOverlay';
import { LegendWidget } from './LegendWidget';
import { PollutionPage } from './PollutionPage';
import { ForecastPage } from './ForecastPage';
import { PopulationPage } from './PopulationPage';
import { ClimatePage } from './ClimatePage';

interface DashboardProps {
  onLogout: () => void;
}

export type LayerType = 'pollution' | 'population' | 'climate' | 'forecast' | null;
export type ViewMode = 'map' | 'pollution' | 'forecast' | 'population' | 'climate';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  type: 'pollution' | 'climate';
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeLayer, setActiveLayer] = useState<LayerType>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [timelineValue, setTimelineValue] = useState<number>(50);

  // Mock station data
  const stations: Station[] = [
    { id: '1', name: 'Worli', lat: 19.0, lng: 72.8, aqi: 156, type: 'pollution' },
    { id: '2', name: 'Andheri', lat: 19.1, lng: 72.85, aqi: 142, type: 'pollution' },
    { id: '3', name: 'Bandra', lat: 19.05, lng: 72.84, aqi: 98, type: 'pollution' },
    { id: '4', name: 'Colaba', lat: 18.9, lng: 72.82, aqi: 87, type: 'pollution' },
    { id: '5', name: 'Powai', lat: 19.12, lng: 72.9, aqi: 112, type: 'pollution' },
    { id: '6', name: 'Dadar', lat: 19.02, lng: 72.84, aqi: 168, type: 'pollution' },
    { id: '7', name: 'Borivali', lat: 19.23, lng: 72.86, aqi: 95, type: 'pollution' },
    { id: '8', name: 'Malad', lat: 19.18, lng: 72.85, aqi: 134, type: 'pollution' },
  ];

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
    setViewMode('map');
  };

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    if (view === 'pollution') setActiveLayer('pollution');
    if (view === 'forecast') setActiveLayer('forecast');
    if (view === 'population') setActiveLayer('population');
    if (view === 'climate') setActiveLayer('climate');
    if (view === 'map') setActiveLayer(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      {/* Map View */}
      {viewMode === 'map' && (
        <>
          {/* Background Map */}
          <div className="absolute inset-0 z-0">
            <MapBackground 
              activeLayer={activeLayer}
              onStationClick={handleStationClick}
              stations={stations}
            />
          </div>

          {/* Overlay gradient for better UI visibility */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-slate-900/20 pointer-events-none" />

          {/* Top Navigation */}
          <TopNavigation onLogout={onLogout} userName="Admin User" />

          {/* Floating Sidebar */}
          <FloatingSidebar 
            activeLayer={activeLayer}
            onLayerChange={handleLayerChange}
            onViewChange={handleViewChange}
          />

          {/* Search Bar */}
          <SearchBar />

          {/* Timeline Scrubber */}
          <TimelineScrubber 
            value={timelineValue}
            onChange={setTimelineValue}
          />

          {/* Analytics Overlay */}
          {selectedStation && (
            <AnalyticsOverlay 
              station={selectedStation}
              onClose={() => setSelectedStation(null)}
            />
          )}

          {/* Legend Widget */}
          {activeLayer && <LegendWidget activeLayer={activeLayer} />}
        </>
      )}

      {/* Dedicated Pages */}
      {viewMode === 'pollution' && (
        <PollutionPage 
          onBack={() => setViewMode('map')}
          stations={stations}
        />
      )}

      {viewMode === 'forecast' && (
        <ForecastPage 
          onBack={() => setViewMode('map')}
          stations={stations}
        />
      )}

      {viewMode === 'population' && (
        <PopulationPage 
          onBack={() => setViewMode('map')}
        />
      )}

      {viewMode === 'climate' && (
        <ClimatePage 
          onBack={() => setViewMode('map')}
        />
      )}
    </div>
  );
};
