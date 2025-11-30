import React from 'react';
import { Cloud, Sparkles, Users, Thermometer, Map, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { LayerType, ViewMode } from './Dashboard';

interface FloatingSidebarProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  onViewChange: (view: ViewMode) => void;
}

interface NavItem {
  id: LayerType;
  icon: React.ElementType;
  label: string;
  color: string;
  hoverColor: string;
  activeColor: string;
  badge?: string;
  view: ViewMode;
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ 
  activeLayer, 
  onLayerChange,
  onViewChange 
}) => {
  const navItems: NavItem[] = [
    {
      id: 'pollution',
      icon: Cloud,
      label: 'Live Pollution',
      color: 'from-red-500 to-orange-500',
      hoverColor: 'hover:from-red-600 hover:to-orange-600',
      activeColor: 'from-red-600 to-orange-600',
      view: 'pollution'
    },
    {
      id: 'forecast',
      icon: Sparkles,
      label: 'AI Forecast',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      activeColor: 'from-purple-600 to-pink-600',
      badge: 'BETA',
      view: 'forecast'
    },
    {
      id: 'population',
      icon: Users,
      label: 'Population',
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-600',
      activeColor: 'from-blue-600 to-indigo-600',
      view: 'population'
    },
    {
      id: 'climate',
      icon: Thermometer,
      label: 'Climate',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600',
      activeColor: 'from-orange-600 to-red-600',
      view: 'climate'
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (activeLayer === item.id) {
      // If clicking the active layer, go to detailed view
      onViewChange(item.view);
    } else {
      // Otherwise, just toggle the layer
      onLayerChange(item.id);
    }
  };

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30">
      {/* Main Navigation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/20 shadow-2xl space-y-2">
        {/* Map View Toggle */}
        <Button
          onClick={() => {
            onLayerChange(null);
            onViewChange('map');
          }}
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-xl transition-all ${
            activeLayer === null
              ? 'bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-lg'
              : 'text-white hover:bg-white/20'
          }`}
          title="Map View"
        >
          <Map className="w-6 h-6" />
        </Button>

        <div className="h-px bg-white/20 my-2" />

        {/* Layer Toggles */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeLayer === item.id;

          return (
            <div key={item.id} className="relative group">
              <Button
                onClick={() => handleItemClick(item)}
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-xl transition-all relative ${
                  isActive
                    ? `bg-gradient-to-br ${item.activeColor} text-white shadow-lg scale-105`
                    : `text-white hover:bg-white/20 ${item.hoverColor}`
                }`}
                title={item.label}
              >
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg">
                    {item.badge}
                  </span>
                )}
              </Button>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20 shadow-xl whitespace-nowrap">
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-teal-200 text-xs">
                    {isActive ? 'Click for details' : 'Click to toggle'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="h-px bg-white/20 my-2" />

        {/* Analytics View */}
        <Button
          onClick={() => onViewChange('map')}
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl text-white hover:bg-white/20 transition-all"
          title="Analytics"
        >
          <BarChart3 className="w-6 h-6" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
        <p className="text-xs text-teal-100 mb-2">Active Stations</p>
        <p className="text-white text-2xl">24</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-teal-100">Live Updates</span>
        </div>
      </div>
    </div>
  );
};
