'use client';

import { useMemo } from 'react';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  smooth?: boolean;
}

export function LineChart({
  data,
  color = '#00ffff',
  height = 200,
  showGrid = true,
  showDots = true,
  showLabels = true,
  smooth = true,
}: LineChartProps) {
  const { path, dots, maxValue, minValue } = useMemo(() => {
    if (data.length === 0) return { path: '', dots: [], maxValue: 0, minValue: 0 };

    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const width = 100;
    const padding = 10;
    const chartHeight = height - padding * 2;

    // Calculate points
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight;
      return { x, y, value: d.value, label: d.label || d.date };
    });

    // Generate path
    let path = `M ${points[0].x} ${points[0].y}`;

    if (smooth && points.length > 2) {
      // Smooth curve using quadratic bezier
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const controlX = (current.x + next.x) / 2;
        const controlY = (current.y + next.y) / 2;
        path += ` Q ${current.x} ${current.y}, ${controlX} ${controlY}`;
      }
      // Final point
      const last = points[points.length - 1];
      path += ` T ${last.x} ${last.y}`;
    } else {
      // Straight lines
      points.slice(1).forEach((point) => {
        path += ` L ${point.x} ${point.y}`;
      });
    }

    return { path, dots: points, maxValue, minValue };
  }, [data, height, smooth]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-white/40">No data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-10">
            {[0, 25, 50, 75, 100].map((y) => (
              <line key={y} x1="10" y1={y} x2="90" y2={y} stroke="white" strokeWidth="0.2" />
            ))}
          </g>
        )}

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 90 90 L 10 90 Z`} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={path} fill="none" stroke={color} strokeWidth="0.5" strokeLinecap="round" />

        {/* Dots */}
        {showDots &&
          dots.map((dot, i) => (
            <g key={i}>
              <circle cx={dot.x} cy={dot.y} r="1" fill={color} className="opacity-80" />
              <circle cx={dot.x} cy={dot.y} r="0.5" fill="white" />
            </g>
          ))}
      </svg>

      {/* Labels and values */}
      {showLabels && (
        <div className="absolute inset-x-0 top-0 flex justify-between px-4 -mt-6">
          <div className="text-xs text-white/60">{data[0].label || data[0].date}</div>
          <div className="text-xs text-white/60">
            {data[data.length - 1].label || data[data.length - 1].date}
          </div>
        </div>
      )}

      {/* Min/Max indicators */}
      <div className="absolute right-0 top-0 text-xs text-white/60">{Math.round(maxValue)}</div>
      <div className="absolute right-0 bottom-0 text-xs text-white/60">{Math.round(minValue)}</div>
    </div>
  );
}
