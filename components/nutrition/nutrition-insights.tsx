'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart } from '@/components/analytics/line-chart';
import { BarChart } from '@/components/analytics/bar-chart';

interface NutritionStats {
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
  avg_fiber: number;
  total_meals_logged: number;
  days_tracked: number;
  consistency_score: number;
}

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water_liters: number;
  meal_count: number;
}

interface NutritionGoals {
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  fiber_target: number;
  water_target: number;
}

interface MacroDistribution {
  protein_percent: number;
  carbs_percent: number;
  fat_percent: number;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  icon: string;
}

export function NutritionInsights() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [stats, setStats] = useState<NutritionStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyNutrition[]>([]);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadNutritionData();
  }, [timeRange]);

  async function loadNutritionData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile with nutrition goals
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setGoals({
          calories_target: profile.target_calories || 2000,
          protein_target: profile.target_protein || 150,
          carbs_target: profile.target_carbs || 200,
          fat_target: profile.target_fat || 65,
          fiber_target: 30,
          water_target: 2.5,
        });
      }

      // Load nutrition logs for time range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const { data: logs } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', startDate.toISOString().split('T')[0])
        .order('log_date', { ascending: true });

      if (logs) {
        // Group by date and calculate daily totals
        const dailyMap = new Map<string, DailyNutrition>();

        logs.forEach((log: any) => {
          const date = log.log_date;

          if (!dailyMap.has(date)) {
            dailyMap.set(date, {
              date,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              water_liters: 0,
              meal_count: 0,
            });
          }

          const daily = dailyMap.get(date)!;
          daily.calories += log.calories || 0;
          daily.protein += log.protein_grams || 0;
          daily.carbs += log.carbs_grams || 0;
          daily.fat += log.fat_grams || 0;
          daily.fiber += log.fiber_grams || 0;
          daily.meal_count += 1;
        });

        const dailyArray = Array.from(dailyMap.values());
        setDailyData(dailyArray);

        // Calculate statistics
        if (dailyArray.length > 0) {
          const totalDays = dailyArray.length;
          const stats: NutritionStats = {
            avg_calories: dailyArray.reduce((sum, d) => sum + d.calories, 0) / totalDays,
            avg_protein: dailyArray.reduce((sum, d) => sum + d.protein, 0) / totalDays,
            avg_carbs: dailyArray.reduce((sum, d) => sum + d.carbs, 0) / totalDays,
            avg_fat: dailyArray.reduce((sum, d) => sum + d.fat, 0) / totalDays,
            avg_fiber: dailyArray.reduce((sum, d) => sum + d.fiber, 0) / totalDays,
            total_meals_logged: logs.length,
            days_tracked: totalDays,
            consistency_score: (totalDays / timeRange) * 100,
          };

          setStats(stats);

          // Generate insights
          generateInsights(stats, dailyArray, goals);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      setLoading(false);
    }
  }

  function generateInsights(
    stats: NutritionStats,
    daily: DailyNutrition[],
    goals: NutritionGoals | null
  ) {
    const newInsights: Insight[] = [];

    if (!goals) return;

    // Calorie adherence
    const calorieDiff = stats.avg_calories - goals.calories_target;
    const caloriePercent = Math.abs(calorieDiff / goals.calories_target) * 100;

    if (Math.abs(calorieDiff) < 100) {
      newInsights.push({
        type: 'success',
        title: 'Excellent Calorie Control',
        message: `You're averaging ${Math.round(stats.avg_calories)} calories per day, right on target! Keep up the great work.`,
        icon: 'check_circle',
      });
    } else if (calorieDiff > 0 && caloriePercent > 10) {
      newInsights.push({
        type: 'warning',
        title: 'Calorie Surplus Detected',
        message: `You're averaging ${Math.round(calorieDiff)} calories over your target. Consider reducing portion sizes or increasing activity.`,
        icon: 'warning',
      });
    } else if (calorieDiff < 0 && caloriePercent > 10) {
      newInsights.push({
        type: 'warning',
        title: 'Calorie Deficit High',
        message: `You're averaging ${Math.round(Math.abs(calorieDiff))} calories below target. Ensure you're eating enough to support your activity level.`,
        icon: 'info',
      });
    }

    // Protein intake
    if (stats.avg_protein >= goals.protein_target) {
      newInsights.push({
        type: 'success',
        title: 'Protein Target Met',
        message: `Great job hitting your protein goal of ${goals.protein_target}g! This supports muscle growth and recovery.`,
        icon: 'fitness_center',
      });
    } else if (stats.avg_protein < goals.protein_target * 0.8) {
      newInsights.push({
        type: 'error',
        title: 'Low Protein Intake',
        message: `You're ${Math.round(goals.protein_target - stats.avg_protein)}g below your protein target. Consider adding lean meats, eggs, or protein shakes.`,
        icon: 'priority_high',
      });
    }

    // Fiber intake
    if (stats.avg_fiber < 20) {
      newInsights.push({
        type: 'info',
        title: 'Increase Fiber Intake',
        message: 'Aim for 25-30g of fiber daily. Add more vegetables, fruits, whole grains, and legumes to your meals.',
        icon: 'local_florist',
      });
    }

    // Consistency
    if (stats.consistency_score >= 80) {
      newInsights.push({
        type: 'success',
        title: 'Excellent Tracking Consistency',
        message: `You've logged ${stats.days_tracked} out of ${timeRange} days! Consistency is key to success.`,
        icon: 'calendar_month',
      });
    } else if (stats.consistency_score < 50) {
      newInsights.push({
        type: 'warning',
        title: 'Improve Tracking Consistency',
        message: 'Try to log your meals more consistently. Set reminders after each meal to build the habit.',
        icon: 'notifications',
      });
    }

    // Meal frequency
    const avg_meals_per_day = stats.total_meals_logged / stats.days_tracked;
    if (avg_meals_per_day < 3) {
      newInsights.push({
        type: 'info',
        title: 'Consider More Frequent Meals',
        message: `You're averaging ${avg_meals_per_day.toFixed(1)} meals per day. 4-5 smaller meals can help maintain energy and metabolism.`,
        icon: 'restaurant',
      });
    }

    setInsights(newInsights);
  }

  const getMacroDistribution = (): MacroDistribution | null => {
    if (!stats) return null;

    const protein_cal = stats.avg_protein * 4;
    const carbs_cal = stats.avg_carbs * 4;
    const fat_cal = stats.avg_fat * 9;
    const total = protein_cal + carbs_cal + fat_cal;

    if (total === 0) return null;

    return {
      protein_percent: (protein_cal / total) * 100,
      carbs_percent: (carbs_cal / total) * 100,
      fat_percent: (fat_cal / total) * 100,
    };
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50';
      default:
        return 'bg-white/10 border-white/30';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-white/60';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-32 bg-white/10 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const macroDistribution = getMacroDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Nutrition Insights</h1>
          <p className="text-white/60">Track your nutrition and get personalized recommendations</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days as any)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                timeRange === days
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {stats && goals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-primary text-3xl">
                local_fire_department
              </span>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{Math.round(stats.avg_calories)}</p>
                <p className="text-white/60 text-sm">/ {goals.calories_target}</p>
              </div>
            </div>
            <p className="text-white/60 text-sm">Avg Calories</p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min((stats.avg_calories / goals.calories_target) * 100, 100)}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-green-500 text-3xl">
                fitness_center
              </span>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{Math.round(stats.avg_protein)}g</p>
                <p className="text-white/60 text-sm">/ {goals.protein_target}g</p>
              </div>
            </div>
            <p className="text-white/60 text-sm">Avg Protein</p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((stats.avg_protein / goals.protein_target) * 100, 100)}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-yellow-500 text-3xl">
                calendar_month
              </span>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stats.days_tracked}</p>
                <p className="text-white/60 text-sm">/ {timeRange} days</p>
              </div>
            </div>
            <p className="text-white/60 text-sm">Days Tracked</p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.consistency_score}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-purple-500 text-3xl">
                restaurant
              </span>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stats.total_meals_logged}</p>
                <p className="text-white/60 text-sm">meals</p>
              </div>
            </div>
            <p className="text-white/60 text-sm">Total Logged</p>
            <p className="text-white/40 text-xs mt-2">
              {(stats.total_meals_logged / stats.days_tracked).toFixed(1)} per day
            </p>
          </Card>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className={`p-4 border ${getInsightColor(insight.type)}`}>
              <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-2xl ${getInsightIconColor(insight.type)}`}>
                  {insight.icon}
                </span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
                  <p className="text-white/80 text-sm">{insight.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {dailyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calorie Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Calorie Trend</h3>
            <LineChart
              data={dailyData.map((d) => ({
                label: new Date(d.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                }),
                value: d.calories,
              }))}
              height={200}
              color="#00ffff"
            />
            {goals && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/60">Target:</span>
                <span className="text-primary font-semibold">{goals.calories_target} cal</span>
              </div>
            )}
          </Card>

          {/* Protein Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Protein Trend</h3>
            <LineChart
              data={dailyData.map((d) => ({
                label: new Date(d.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                }),
                value: d.protein,
              }))}
              height={200}
              color="#10b981"
            />
            {goals && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/60">Target:</span>
                <span className="text-green-400 font-semibold">{goals.protein_target}g</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Macro Distribution */}
      {macroDistribution && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Macro Distribution</h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-400">
                {macroDistribution.protein_percent.toFixed(0)}%
              </p>
              <p className="text-white/60 text-sm mt-1">Protein</p>
              <p className="text-white/40 text-xs">{Math.round(stats!.avg_protein)}g</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-400">
                {macroDistribution.carbs_percent.toFixed(0)}%
              </p>
              <p className="text-white/60 text-sm mt-1">Carbs</p>
              <p className="text-white/40 text-xs">{Math.round(stats!.avg_carbs)}g</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-400">
                {macroDistribution.fat_percent.toFixed(0)}%
              </p>
              <p className="text-white/60 text-sm mt-1">Fat</p>
              <p className="text-white/40 text-xs">{Math.round(stats!.avg_fat)}g</p>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${macroDistribution.protein_percent}%` }}
            >
              {macroDistribution.protein_percent > 15 && 'P'}
            </div>
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${macroDistribution.carbs_percent}%` }}
            >
              {macroDistribution.carbs_percent > 15 && 'C'}
            </div>
            <div
              className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${macroDistribution.fat_percent}%` }}
            >
              {macroDistribution.fat_percent > 15 && 'F'}
            </div>
          </div>

          <p className="text-white/60 text-sm mt-4">
            Ideal ratios vary by goal. For muscle building: 30-35% protein, 40-50% carbs, 20-30% fat
          </p>
        </Card>
      )}

      {/* No Data State */}
      {dailyData.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              restaurant
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">No nutrition data yet</h3>
            <p className="text-white/60 mb-6">
              Start logging your meals to see insights and track your progress!
            </p>
            <Button>
              <span className="material-symbols-outlined mr-2">add</span>
              Log First Meal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
