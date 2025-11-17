'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Card } from './ui/card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightData {
  date: string;
  weight: number;
  bodyFat?: number;
}

interface WeightTrendChartProps {
  days?: 7 | 30 | 90 | 365;
}

export function WeightTrendChart({ days = 30 }: WeightTrendChartProps) {
  const [data, setData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90 | 365>(days);

  const supabase = createClient();

  useEffect(() => {
    fetchWeightData();
  }, [period]);

  const fetchWeightData = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = subDays(new Date(), period);

      const { data: measurements, error } = await supabase
        .from('body_measurements')
        .select('date, weight, body_fat_percentage')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedData: WeightData[] = (measurements || []).map(m => ({
        date: format(new Date(m.date), 'MMM dd'),
        weight: m.weight,
        bodyFat: m.body_fat_percentage || undefined,
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = () => {
    if (data.length < 2) return null;

    const firstWeight = data[0].weight;
    const lastWeight = data[data.length - 1].weight;
    const change = lastWeight - firstWeight;
    const percentChange = (change / firstWeight) * 100;

    return {
      change,
      percentChange,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  };

  const trend = calculateTrend();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Weight Trend</h3>
          {trend && (
            <div className="flex items-center gap-2 mt-1">
              {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
              {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
              {trend.direction === 'stable' && <Minus className="w-4 h-4 text-white/60" />}
              <span className={`text-sm font-medium ${
                trend.direction === 'up' ? 'text-red-400' :
                trend.direction === 'down' ? 'text-green-400' :
                'text-white/60'
              }`}>
                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)} kg ({trend.percentChange.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {([7, 30, 90, 365] as const).map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === d
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {d === 7 ? '7D' : d === 30 ? '1M' : d === 90 ? '3M' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-white/60">
          <p>No weight data available. Start tracking your weight to see trends!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: 'rgba(255,255,255,0.6)' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: 'rgba(255,255,255,0.6)' }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              name="Weight (kg)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {data.some(d => d.bodyFat) && (
              <Line
                type="monotone"
                dataKey="bodyFat"
                name="Body Fat %"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
