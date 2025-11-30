import React, { useEffect, useRef, useState } from 'react';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  type: 'pollution' | 'climate';
}

interface MapBackgroundProps {
  activeLayer: 'pollution' | 'population' | 'climate' | 'forecast' | null;
  onStationClick?: (station: Station) => void;
  stations: Station[];
}

export const MapBackground: React.FC<MapBackgroundProps> = ({ 
  activeLayer, 
  onStationClick,
  stations 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Mumbai map outline (simplified)
    drawMumbaiMap(ctx, canvas.width, canvas.height);

    // Draw data based on active layer
    if (activeLayer) {
      drawDataLayer(ctx, canvas.width, canvas.height, activeLayer);
    }

    // Draw stations
    drawStations(ctx, canvas.width, canvas.height, stations, hoveredStation);
  }, [activeLayer, stations, hoveredStation]);

  const drawMumbaiMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Simplified Mumbai outline
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.3;

    ctx.moveTo(centerX - scale * 0.3, centerY - scale * 0.8);
    ctx.lineTo(centerX - scale * 0.4, centerY - scale * 0.4);
    ctx.lineTo(centerX - scale * 0.5, centerY);
    ctx.lineTo(centerX - scale * 0.4, centerY + scale * 0.6);
    ctx.lineTo(centerX - scale * 0.2, centerY + scale * 0.9);
    ctx.lineTo(centerX + scale * 0.1, centerY + scale * 0.95);
    ctx.lineTo(centerX + scale * 0.4, centerY + scale * 0.7);
    ctx.lineTo(centerX + scale * 0.5, centerY + scale * 0.3);
    ctx.lineTo(centerX + scale * 0.45, centerY - scale * 0.2);
    ctx.lineTo(centerX + scale * 0.3, centerY - scale * 0.6);
    ctx.lineTo(centerX, centerY - scale * 0.85);
    ctx.closePath();
    ctx.stroke();

    // Add grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  };

  const drawDataLayer = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    layer: string
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw heatmap circles
    const circles = 15;
    for (let i = 0; i < circles; i++) {
      const x = centerX + (Math.random() - 0.5) * width * 0.6;
      const y = centerY + (Math.random() - 0.5) * height * 0.6;
      const radius = 50 + Math.random() * 100;
      
      let color;
      if (layer === 'pollution') {
        const intensity = Math.random();
        color = intensity > 0.7 
          ? `rgba(239, 68, 68, ${0.2 + intensity * 0.2})` 
          : intensity > 0.4
          ? `rgba(251, 191, 36, ${0.2 + intensity * 0.2})`
          : `rgba(34, 197, 94, ${0.2 + intensity * 0.2})`;
      } else if (layer === 'population') {
        color = `rgba(99, 102, 241, ${0.1 + Math.random() * 0.3})`;
      } else if (layer === 'climate') {
        color = `rgba(234, 88, 12, ${0.1 + Math.random() * 0.3})`;
      } else {
        color = `rgba(168, 85, 247, ${0.1 + Math.random() * 0.3})`;
      }

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawStations = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stations: Station[],
    hoveredId: string | null
  ) => {
    stations.forEach(station => {
      const x = (station.lng + 100) / 200 * width;
      const y = (1 - (station.lat + 50) / 100) * height;
      
      const isHovered = station.id === hoveredId;
      const size = isHovered ? 12 : 8;

      // Glow effect
      if (isHovered) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = station.aqi > 150 ? '#ef4444' : station.aqi > 100 ? '#f59e0b' : '#14b8a6';
      }

      // Draw station marker
      ctx.fillStyle = station.aqi > 150 
        ? '#ef4444' 
        : station.aqi > 100 
        ? '#f59e0b' 
        : '#14b8a6';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw outer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size + 3, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if hovering over a station
    let found = false;
    for (const station of stations) {
      const stationX = (station.lng + 100) / 200 * canvas.width;
      const stationY = (1 - (station.lat + 50) / 100) * canvas.height;
      const distance = Math.sqrt((x - stationX) ** 2 + (y - stationY) ** 2);

      if (distance < 15) {
        setHoveredStation(station.id);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredStation(null);
      canvas.style.cursor = 'default';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onStationClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a station
    for (const station of stations) {
      const stationX = (station.lng + 100) / 200 * canvas.width;
      const stationY = (1 - (station.lat + 50) / 100) * canvas.height;
      const distance = Math.sqrt((x - stationX) ** 2 + (y - stationY) ** 2);

      if (distance < 15) {
        onStationClick(station);
        break;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
};
