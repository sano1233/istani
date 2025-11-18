'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

interface AdvancedChartsProps {
  weightData?: DataPoint[];
  calorieData?: DataPoint[];
  macroData?: Array<{ date: string; protein: number; carbs: number; fat: number }>;
  workoutData?: DataPoint[];
}

export function AdvancedCharts({
  weightData = [],
  calorieData = [],
  macroData = [],
  workoutData = [],
}: AdvancedChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'calories' | 'macros' | 'workouts'>('weight');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const calculateTrend = (data: DataPoint[]) => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(change),
    };
  };

  const filterDataByTimeRange = (data: DataPoint[]) => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return data.filter(point => new Date(point.date) >= cutoff);
  };

  const weightTrend = calculateTrend(filterDataByTimeRange(weightData));
  const calorieTrend = calculateTrend(filterDataByTimeRange(calorieData));

  // Simple SVG chart rendering
  const renderLineChart = (data: DataPoint[], color: string) => {
    if (data.length === 0) return null;

    const filtered = filterDataByTimeRange(data);
    if (filtered.length === 0) return null;

    const maxValue = Math.max(...filtered.map(d => d.value));
    const minValue = Math.min(...filtered.map(d => d.value));
    const range = maxValue - minValue || 1;
    const width = 100;
    const height = 60;

    const points = filtered.map((d, i) => {
      const x = (i / (filtered.length - 1 || 1)) * width;
      const y = height - ((d.value - minValue) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {filtered.map((d, i) => {
          const x = (i / (filtered.length - 1 || 1)) * width;
          const y = height - ((d.value - minValue) / range) * height;
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
        })}
      </svg>
    );
  };

  const renderMacroChart = () => {
    if (macroData.length === 0) return null;

    const filtered = macroData.filter(point => {
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return new Date(point.date) >= cutoff;
    });

    if (filtered.length === 0) return null;

    const avgProtein = filtered.reduce((sum, d) => sum + d.protein, 0) / filtered.length;
    const avgCarbs = filtered.reduce((sum, d) => sum + d.carbs, 0) / filtered.length;
    const avgFat = filtered.reduce((sum, d) => sum + d.fat, 0) / filtered.length;
    const total = avgProtein + avgCarbs + avgFat;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Protein</span>
            <span className="font-medium">{avgProtein.toFixed(1)}g ({((avgProtein / total) * 100).toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(avgProtein / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Carbs</span>
            <span className="font-medium">{avgCarbs.toFixed(1)}g ({((avgCarbs / total) * 100).toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(avgCarbs / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fat</span>
            <span className="font-medium">{avgFat.toFixed(1)}g ({((avgFat / total) * 100).toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{ width: `${(avgFat / total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === '7d'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === '30d'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange('90d')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === '90d'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          90 Days
        </button>
        <button
          onClick={() => setTimeRange('1y')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === '1y'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          1 Year
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weight Progress
            </CardTitle>
            <CardDescription>
              {weightTrend.direction === 'up' && (
                <span className="flex items-center gap-1 text-red-500">
                  <TrendingUp className="h-4 w-4" />
                  +{weightTrend.percentage.toFixed(1)}%
                </span>
              )}
              {weightTrend.direction === 'down' && (
                <span className="flex items-center gap-1 text-green-500">
                  <TrendingDown className="h-4 w-4" />
                  -{weightTrend.percentage.toFixed(1)}%
                </span>
              )}
              {weightTrend.direction === 'stable' && (
                <span className="text-muted-foreground">No change</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderLineChart(weightData, '#3b82f6')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Calorie Intake
            </CardTitle>
            <CardDescription>
              {calorieTrend.direction === 'up' && (
                <span className="flex items-center gap-1 text-orange-500">
                  <TrendingUp className="h-4 w-4" />
                  +{calorieTrend.percentage.toFixed(1)}%
                </span>
              )}
              {calorieTrend.direction === 'down' && (
                <span className="flex items-center gap-1 text-blue-500">
                  <TrendingDown className="h-4 w-4" />
                  -{calorieTrend.percentage.toFixed(1)}%
                </span>
              )}
              {calorieTrend.direction === 'stable' && (
                <span className="text-muted-foreground">Consistent</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderLineChart(calorieData, '#f59e0b')}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Macro Distribution</CardTitle>
          <CardDescription>Average macronutrient breakdown for selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {renderMacroChart()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout Frequency</CardTitle>
          <CardDescription>Training sessions over time</CardDescription>
        </CardHeader>
        <CardContent>
          {renderLineChart(workoutData, '#10b981')}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdvancedCharts;
