'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type Period = 'week' | 'month' | 'year' | 'all';

interface DataPoint {
  date: string;
  weight?: number;
  bodyFat?: number;
  formattedDate: string;
}

interface ProgressChartProps {
  data: DataPoint[];
  className?: string;
}

export function ProgressChart({ data, className }: ProgressChartProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [activeMetric, setActiveMetric] = useState<'both' | 'weight' | 'bodyFat'>('both');

  // Filter data based on selected period
  const filterDataByPeriod = (data: DataPoint[], period: Period): DataPoint[] => {
    if (period === 'all') return data;

    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter((d) => new Date(d.date) >= cutoffDate);
  };

  const filteredData = filterDataByPeriod(data, period);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/90 border border-primary/50 rounded-lg p-4 shadow-xl"
        >
          <p className="text-white font-semibold mb-2">{payload[0].payload.formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
              {entry.dataKey === 'weight' ? ' kg' : '%'}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const showWeight = activeMetric === 'both' || activeMetric === 'weight';
  const showBodyFat = activeMetric === 'both' || activeMetric === 'bodyFat';

  return (
    <Card className={className}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Progress Over Time</h2>
          <p className="text-white/60 text-sm">
            {filteredData.length} measurement{filteredData.length !== 1 ? 's' : ''} shown
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Period selector */}
          {(['week', 'month', 'year', 'all'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Metric toggles */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeMetric === 'both' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveMetric('both')}
        >
          Both Metrics
        </Button>
        <Button
          variant={activeMetric === 'weight' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveMetric('weight')}
        >
          Weight Only
        </Button>
        <Button
          variant={activeMetric === 'bodyFat' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveMetric('bodyFat')}
        >
          Body Fat Only
        </Button>
      </div>

      {/* Chart */}
      {filteredData.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="formattedDate"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="weight"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                domain={['auto', 'auto']}
                hide={!showWeight}
              />
              <YAxis
                yAxisId="bodyFat"
                orientation="right"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                domain={['auto', 'auto']}
                hide={!showBodyFat}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {showWeight && (
                <Area
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  name="Weight (kg)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              )}
              {showBodyFat && (
                <Area
                  yAxisId="bodyFat"
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBodyFat)"
                  name="Body Fat (%)"
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-[400px] flex items-center justify-center border border-white/10 rounded-lg bg-white/5">
          <div className="text-center">
            <span className="material-symbols-outlined text-white/20 text-6xl mb-4 block">
              insert_chart
            </span>
            <p className="text-white/60">No data available for selected period</p>
          </div>
        </div>
      )}

      {/* Legend summary */}
      {filteredData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4"
        >
          {showWeight && (
            <div>
              <p className="text-white/60 text-sm mb-1">Weight Range</p>
              <p className="text-white font-semibold">
                {Math.min(...filteredData.map((d) => d.weight || 0)).toFixed(1)} -{' '}
                {Math.max(...filteredData.map((d) => d.weight || 0)).toFixed(1)} kg
              </p>
            </div>
          )}
          {showBodyFat && (
            <div>
              <p className="text-white/60 text-sm mb-1">Body Fat Range</p>
              <p className="text-white font-semibold">
                {Math.min(...filteredData.filter((d) => d.bodyFat).map((d) => d.bodyFat || 0)).toFixed(1)}% -{' '}
                {Math.max(...filteredData.filter((d) => d.bodyFat).map((d) => d.bodyFat || 0)).toFixed(1)}%
              </p>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}
