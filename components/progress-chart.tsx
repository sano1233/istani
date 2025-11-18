'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useMemo } from 'react';

interface DataPoint {
  measured_at: string;
  [key: string]: any;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  dataKey: string;
  unit: string;
  color: string;
  target?: number;
}

export function ProgressChart({ title, data, dataKey, unit, color, target }: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map((d) => d[dataKey]).filter((v) => v != null);
    if (values.length === 0) return null;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Add target to range calculation if provided
    const adjustedMin = target ? Math.min(minValue, target) : minValue;
    const adjustedMax = target ? Math.max(maxValue, target) : maxValue;
    const adjustedRange = adjustedMax - adjustedMin || 1;

    return {
      points: data
        .map((d, i) => {
          const value = d[dataKey];
          if (value == null) return null;

          return {
            x: (i / (data.length - 1)) * 100,
            y: 100 - ((value - adjustedMin) / adjustedRange) * 100,
            value,
            date: new Date(d.measured_at),
          };
        })
        .filter(Boolean),
      minValue: adjustedMin,
      maxValue: adjustedMax,
      currentValue: values[values.length - 1],
      startValue: values[0],
      change: values[values.length - 1] - values[0],
    };
  }, [data, dataKey, target]);

  if (!chartData || chartData.points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-white/40">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-2 block opacity-40">
                show_chart
              </span>
              <p>No data yet</p>
              <p className="text-sm mt-1">Start logging your progress to see your chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create SVG path
  const pathD = chartData.points
    .map((point, i) => {
      const command = i === 0 ? 'M' : 'L';
      return `${command} ${point!.x} ${point!.y}`;
    })
    .join(' ');

  // Create area path
  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {chartData.currentValue.toFixed(1)}
              <span className="text-lg text-white/60">{unit}</span>
            </p>
            <p
              className={`text-sm font-semibold ${
                chartData.change < 0
                  ? 'text-green-400'
                  : chartData.change > 0
                    ? 'text-red-400'
                    : 'text-white/60'
              }`}
            >
              {chartData.change > 0 ? '+' : ''}
              {chartData.change.toFixed(1)}
              {unit} from start
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-white/10"
              />
            ))}

            {/* Target line */}
            {target && (
              <>
                {(() => {
                  const targetY =
                    100 -
                    ((target - chartData.minValue) / (chartData.maxValue - chartData.minValue)) *
                      100;
                  return (
                    <>
                      <line
                        x1="0"
                        y1={targetY}
                        x2="100"
                        y2={targetY}
                        stroke="#0df259"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                        opacity="0.5"
                      />
                      <text x="95" y={targetY - 2} fontSize="3" fill="#0df259" textAnchor="end">
                        Target: {target}
                        {unit}
                      </text>
                    </>
                  );
                })()}
              </>
            )}

            {/* Area under line */}
            <path d={areaD} fill={color} opacity="0.1" />

            {/* Progress line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point!.x}
                  cy={point!.y}
                  r="1.5"
                  fill={color}
                  className="hover:r-2 transition-all"
                />
              </g>
            ))}
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-white/60">
            <span>{chartData.maxValue.toFixed(1)}</span>
            <span>{((chartData.maxValue + chartData.minValue) / 2).toFixed(1)}</span>
            <span>{chartData.minValue.toFixed(1)}</span>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-white/60 mt-2">
            <span>
              {chartData.points[0]!.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>
              {chartData.points[chartData.points.length - 1]!.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-sm text-white/60 mb-1">Starting</p>
            <p className="text-lg font-semibold text-white">
              {chartData.startValue.toFixed(1)}
              {unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60 mb-1">Current</p>
            <p className="text-lg font-semibold text-white">
              {chartData.currentValue.toFixed(1)}
              {unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60 mb-1">Change</p>
            <p
              className={`text-lg font-semibold ${
                chartData.change < 0
                  ? 'text-green-400'
                  : chartData.change > 0
                    ? 'text-red-400'
                    : 'text-white'
              }`}
            >
              {chartData.change > 0 ? '+' : ''}
              {chartData.change.toFixed(1)}
              {unit}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
