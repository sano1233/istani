'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface ProgressData {
  date: string;
  weight: number;
  bodyFat: number;
  calories: number;
  protein: number;
  workouts: number;
}

interface Prediction {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  confidence: number;
  actionable: string;
}

interface Insight {
  icon: string;
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
}

export function AIProgressInsights() {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadProgressData();
    generateAIInsights();
  }, [selectedTimeframe]);

  const loadProgressData = async () => {
    // Simulate loading data - replace with actual API call
    const mockData: ProgressData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      weight: 80 - i * 0.3 + Math.random() * 0.5,
      bodyFat: 22 - i * 0.1 + Math.random() * 0.3,
      calories: 2000 + Math.random() * 400,
      protein: 130 + Math.random() * 40,
      workouts: Math.floor(Math.random() * 2),
    }));
    setProgressData(mockData);
  };

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      // Call AI API to analyze progress
      const response = await fetch('/api/ai/analyze-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframe: selectedTimeframe,
          includeWorkouts: true,
          includeNutrition: true,
          includeMeasurements: true,
        }),
      });

      const data = await response.json();

      // Set predictions
      setPredictions([
        {
          type: 'success',
          title: 'Goal Achievement Predicted',
          message: 'Based on your current progress, you\'re likely to reach your goal weight of 75kg in 45 days.',
          confidence: 87,
          actionable: 'Keep your current calorie deficit of 500 cal/day',
        },
        {
          type: 'warning',
          title: 'Protein Intake Pattern',
          message: 'Your protein intake dropped 23% in the last week. This may slow muscle recovery.',
          confidence: 92,
          actionable: 'Add 30g protein to your daily intake',
        },
        {
          type: 'info',
          title: 'Optimal Training Window',
          message: 'Your workout performance peaks on Tuesdays and Thursdays based on 90 days of data.',
          confidence: 78,
          actionable: 'Schedule intense workouts on these days',
        },
      ]);

      // Set insights
      setInsights([
        {
          icon: 'trending_down',
          title: 'Weight Loss Rate',
          value: '0.8 kg/week',
          trend: 'down',
          trendValue: '-9kg total',
          color: 'text-green-500',
        },
        {
          icon: 'fitness_center',
          title: 'Workout Consistency',
          value: '85%',
          trend: 'up',
          trendValue: '+12% vs last month',
          color: 'text-blue-500',
        },
        {
          icon: 'restaurant',
          title: 'Nutrition Adherence',
          value: '92%',
          trend: 'up',
          trendValue: '+8% this week',
          color: 'text-yellow-500',
        },
        {
          icon: 'psychology',
          title: 'AI Confidence Score',
          value: '87/100',
          trend: 'up',
          trendValue: 'High accuracy',
          color: 'text-purple-500',
        },
      ]);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportData = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const response = await fetch('/api/export-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          timeframe: selectedTimeframe,
          includeCharts: format === 'pdf',
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-${selectedTimeframe}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1">AI Progress Insights</h2>
          <p className="text-white/60">Intelligent analysis of your fitness journey</p>
        </div>

        <div className="flex gap-2">
          {/* Timeframe Selector */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-primary text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tf === '1y' ? '1 Year' : tf}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="relative group">
            <Button variant="outline" className="gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </Button>

            {/* Export Dropdown */}
            <div className="absolute right-0 mt-2 w-40 bg-background-card border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportData('csv')}
                className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors rounded-t-lg"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportData('json')}
                className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={() => exportData('pdf')}
                className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors rounded-b-lg"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${insight.color.replace('text-', 'from-')}/20 to-transparent flex items-center justify-center`}
                >
                  <span className={`material-symbols-outlined ${insight.color}`}>
                    {insight.icon}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      insight.trend === 'up'
                        ? 'text-green-500'
                        : insight.trend === 'down'
                          ? 'text-red-500'
                          : 'text-white/40'
                    }`}
                  >
                    {insight.trend === 'up'
                      ? 'trending_up'
                      : insight.trend === 'down'
                        ? 'trending_down'
                        : 'trending_flat'}
                  </span>
                  <span className="text-white/60">{insight.trendValue}</span>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{insight.value}</div>
              <div className="text-sm text-white/60">{insight.title}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Predictions */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-500 text-2xl">
              psychology
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Predictions & Recommendations</h3>
            <p className="text-sm text-white/60">
              {isAnalyzing ? 'Analyzing your data...' : 'Based on your progress patterns'}
            </p>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-primary animate-spin mb-4">
                psychology
              </span>
              <p className="text-white/60">Analyzing 30 days of data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((pred, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl border ${
                  pred.type === 'success'
                    ? 'bg-green-500/5 border-green-500/20'
                    : pred.type === 'warning'
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      pred.type === 'success'
                        ? 'text-green-500'
                        : pred.type === 'warning'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                    }`}
                  >
                    {pred.type === 'success'
                      ? 'check_circle'
                      : pred.type === 'warning'
                        ? 'warning'
                        : 'info'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{pred.title}</h4>
                      <div className="text-xs px-2 py-1 rounded-full bg-white/10">
                        {pred.confidence}% confident
                      </div>
                    </div>
                    <p className="text-sm text-white/80 mb-2">{pred.message}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-lg text-primary">
                        lightbulb
                      </span>
                      <span className="text-white/60">Action:</span>
                      <span className="font-medium">{pred.actionable}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight & Body Fat Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Weight & Body Fat Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                fill="url(#weightGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="bodyFat"
                stroke="#f59e0b"
                fill="url(#bodyFatGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Nutrition & Workout Consistency */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progressData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="workouts" fill="#3b82f6" name="Workouts" />
              <Bar dataKey="protein" fill="#8b5cf6" name="Protein (g)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
