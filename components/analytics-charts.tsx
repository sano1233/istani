'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnalyticsService, {
  type WorkoutMetrics,
  type NutritionMetrics,
  type BodyMetrics,
} from '@/lib/analytics';

interface AnalyticsChartsProps {
  userId: string;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsCharts({ userId }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [workoutData, setWorkoutData] = useState<WorkoutMetrics[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionMetrics[]>([]);
  const [bodyData, setBodyData] = useState<BodyMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, userId]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    try {
      const [workouts, nutrition, body] = await Promise.all([
        AnalyticsService.getWorkoutMetrics(userId, startDate, endDate),
        AnalyticsService.getNutritionMetrics(userId, startDate, endDate),
        AnalyticsService.getBodyMetrics(userId, startDate, endDate),
      ]);

      setWorkoutData(workouts);
      setNutritionData(nutrition);
      setBodyData(body);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLineChart = (
    data: Array<{ date: string; value: number }>,
    color: string = '#00ff88',
    height: number = 200
  ) => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((maxValue - d.value) / range) * 100;
      return `${x},${y}`;
    });

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = ((maxValue - d.value) / range) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    );
  };

  const renderBarChart = (
    data: Array<{ label: string; value: number }>,
    color: string = '#00ff88',
    height: number = 200
  ) => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = 100 / data.length;

    return (
      <div className="w-full" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {data.map((d, i) => {
            const barHeight = (d.value / maxValue) * 100;
            const x = i * barWidth;
            const y = 100 - barHeight;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={color}
                opacity={0.8}
              />
            );
          })}
        </svg>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {data.map((d, i) => (
            <span key={i} className="flex-1 text-center">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  // Prepare chart data
  const weightChartData = bodyData.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.weight,
  }));

  const caloriesChartData = nutritionData.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.total_calories,
  }));

  const workoutFrequencyData = workoutData.reduce((acc, d) => {
    Object.entries(d.workout_types).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const workoutBarData = Object.entries(workoutFrequencyData).map(([label, value]) => ({
    label: label.substring(0, 3),
    value,
  }));

  const macroTrendsData = nutritionData.slice(-7).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    protein: d.total_protein,
    carbs: d.total_carbs,
    fat: d.total_fat,
  }));

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
            {range === '90d' && 'Last 90 Days'}
            {range === '1y' && 'Last Year'}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weight Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weight Trend</CardTitle>
            <CardDescription>Track your weight over time</CardDescription>
          </CardHeader>
          <CardContent>
            {weightChartData.length > 0 ? (
              <div>
                {renderLineChart(weightChartData, '#00ff88', 200)}
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Start: {weightChartData[0]?.value.toFixed(1)} lbs
                  </span>
                  <span className="text-muted-foreground">
                    Current: {weightChartData[weightChartData.length - 1]?.value.toFixed(1)} lbs
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No weight data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calories Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Calories</CardTitle>
            <CardDescription>Your calorie intake over time</CardDescription>
          </CardHeader>
          <CardContent>
            {caloriesChartData.length > 0 ? (
              <div>
                {renderLineChart(caloriesChartData, '#ff6b6b', 200)}
                <div className="mt-4 text-sm text-center text-muted-foreground">
                  Average:{' '}
                  {(
                    caloriesChartData.reduce((sum, d) => sum + d.value, 0) /
                    caloriesChartData.length
                  ).toFixed(0)}{' '}
                  kcal/day
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No calorie data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Distribution</CardTitle>
            <CardDescription>Breakdown by workout type</CardDescription>
          </CardHeader>
          <CardContent>
            {workoutBarData.length > 0 ? (
              <div>
                {renderBarChart(workoutBarData, '#4ecdc4', 200)}
                <div className="mt-4 text-sm text-center text-muted-foreground">
                  Total Workouts: {workoutData.reduce((sum, d) => sum + d.workout_count, 0)}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No workout data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Macro Nutrients */}
        <Card>
          <CardHeader>
            <CardTitle>Macro Trends (Last 7 Days)</CardTitle>
            <CardDescription>Protein, Carbs, and Fats</CardDescription>
          </CardHeader>
          <CardContent>
            {macroTrendsData.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-green-500">Protein</span>
                    <span className="text-muted-foreground">
                      Avg:{' '}
                      {(
                        macroTrendsData.reduce((sum, d) => sum + d.protein, 0) /
                        macroTrendsData.length
                      ).toFixed(0)}
                      g
                    </span>
                  </div>
                  {renderLineChart(
                    macroTrendsData.map((d) => ({ date: d.date, value: d.protein })),
                    '#00ff88',
                    60
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-blue-500">Carbs</span>
                    <span className="text-muted-foreground">
                      Avg:{' '}
                      {(
                        macroTrendsData.reduce((sum, d) => sum + d.carbs, 0) / macroTrendsData.length
                      ).toFixed(0)}
                      g
                    </span>
                  </div>
                  {renderLineChart(
                    macroTrendsData.map((d) => ({ date: d.date, value: d.carbs })),
                    '#4ecdc4',
                    60
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-yellow-500">Fats</span>
                    <span className="text-muted-foreground">
                      Avg:{' '}
                      {(
                        macroTrendsData.reduce((sum, d) => sum + d.fat, 0) / macroTrendsData.length
                      ).toFixed(0)}
                      g
                    </span>
                  </div>
                  {renderLineChart(
                    macroTrendsData.map((d) => ({ date: d.date, value: d.fat })),
                    '#ffd93d',
                    60
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No nutrition data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
