import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { LayerType } from './Dashboard';

interface LegendWidgetProps {
  activeLayer: LayerType;
}

export const LegendWidget: React.FC<LegendWidgetProps> = ({ activeLayer }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getLegendData = () => {
    switch (activeLayer) {
      case 'pollution':
        return {
          title: 'Air Quality Index',
          items: [
            { label: 'Good (0-50)', color: 'bg-green-500' },
            { label: 'Moderate (51-100)', color: 'bg-yellow-500' },
            { label: 'Unhealthy for Sensitive (101-150)', color: 'bg-orange-500' },
            { label: 'Unhealthy (151-200)', color: 'bg-red-500' },
            { label: 'Very Unhealthy (201+)', color: 'bg-purple-500' },
          ],
        };
      case 'population':
        return {
          title: 'Population Density',
          items: [
            { label: 'Low (< 5k/km²)', color: 'bg-blue-300' },
            { label: 'Medium (5k-10k/km²)', color: 'bg-blue-500' },
            { label: 'High (10k-20k/km²)', color: 'bg-indigo-500' },
            { label: 'Very High (> 20k/km²)', color: 'bg-purple-600' },
          ],
        };
      case 'climate':
        return {
          title: 'Temperature Range',
          items: [
            { label: 'Cool (< 25°C)', color: 'bg-cyan-400' },
            { label: 'Moderate (25-30°C)', color: 'bg-yellow-400' },
            { label: 'Warm (30-35°C)', color: 'bg-orange-500' },
            { label: 'Hot (> 35°C)', color: 'bg-red-600' },
          ],
        };
      case 'forecast':
        return {
          title: 'AI Prediction Confidence',
          items: [
            { label: 'High Confidence (> 90%)', color: 'bg-purple-500' },
            { label: 'Medium Confidence (70-90%)', color: 'bg-purple-400' },
            { label: 'Low Confidence (< 70%)', color: 'bg-purple-300' },
          ],
        };
      default:
        return null;
    }
  };

  const legendData = getLegendData();
  if (!legendData) return null;

  return (
    <div className="absolute bottom-24 right-6 z-30 w-72">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <h3 className="text-white">{legendData.title}</h3>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-teal-300" />
          ) : (
            <ChevronUp className="w-5 h-5 text-teal-300" />
          )}
        </button>

        {/* Legend Items */}
        {isExpanded && (
          <div className="p-4 pt-0 space-y-2">
            {legendData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 ${item.color} rounded-lg shadow-lg flex-shrink-0`} />
                <span className="text-teal-100 text-sm">{item.label}</span>
              </div>
            ))}

            {/* Station Marker Legend */}
            <div className="pt-3 mt-3 border-t border-white/20">
              <p className="text-teal-200 text-xs mb-2">Monitoring Stations</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-teal-400 rounded-full" />
                  <div className="absolute inset-0 w-4 h-4 border-2 border-white/50 rounded-full" />
                </div>
                <span className="text-teal-100 text-sm">Active Station</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
