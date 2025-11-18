// Analytics and Statistics Library for ISTANI
import { createClient } from '@/lib/supabase/server';

export interface WorkoutStats {
  total_workouts: number;
  total_calories: number;
  total_duration_minutes: number;
  avg_duration_minutes: number;
  current_streak: number;
  longest_streak: number;
  this_week: number;
  this_month: number;
  last_month: number;
  growth_rate: number;
}

export interface NutritionStats {
  total_meals_logged: number;
  avg_calories_per_day: number;
  avg_protein_per_day: number;
  avg_carbs_per_day: number;
  avg_fat_per_day: number;
  days_on_track: number;
  compliance_rate: number;
}

export interface ProgressStats {
  weight_change_kg: number;
  weight_change_percent: number;
  body_fat_change: number;
  measurements_taken: number;
  photos_uploaded: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

/**
 * Get comprehensive workout statistics for a user
 */
export async function getWorkoutStats(userId: string, days: number = 30): Promise<WorkoutStats> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total workouts
  const { count: totalWorkouts } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true);

  // Total calories and duration
  const { data: workoutData } = await supabase
    .from('workout_sessions')
    .select('calories_burned, duration_minutes')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('workout_date', startDate.toISOString().split('T')[0]);

  const totalCalories = workoutData?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0;
  const totalDuration = workoutData?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
  const avgDuration = workoutData?.length ? totalDuration / workoutData.length : 0;

  // This week/month
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);

  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);

  const lastMonthEnd = new Date(thisMonthStart);
  lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);

  const { count: thisWeek } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('workout_date', thisWeekStart.toISOString().split('T')[0]);

  const { count: thisMonth } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('workout_date', thisMonthStart.toISOString().split('T')[0]);

  const { count: lastMonth } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('workout_date', lastMonthStart.toISOString().split('T')[0])
    .lte('workout_date', lastMonthEnd.toISOString().split('T')[0]);

  const growthRate = lastMonth ? ((thisMonth! - lastMonth) / lastMonth) * 100 : 0;

  // Streaks (simplified - would need more complex logic for accurate streaks)
  const { data: recentWorkouts } = await supabase
    .from('workout_sessions')
    .select('workout_date')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('workout_date', { ascending: false })
    .limit(90);

  const currentStreak = calculateStreak(recentWorkouts?.map((w) => w.workout_date) || []);
  const longestStreak = calculateLongestStreak(recentWorkouts?.map((w) => w.workout_date) || []);

  return {
    total_workouts: totalWorkouts || 0,
    total_calories: totalCalories,
    total_duration_minutes: totalDuration,
    avg_duration_minutes: Math.round(avgDuration),
    current_streak: currentStreak,
    longest_streak: longestStreak,
    this_week: thisWeek || 0,
    this_month: thisMonth || 0,
    last_month: lastMonth || 0,
    growth_rate: Math.round(growthRate),
  };
}

/**
 * Get nutrition statistics
 */
export async function getNutritionStats(
  userId: string,
  days: number = 30,
): Promise<NutritionStats> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total meals
  const { count: totalMeals } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Daily averages
  const { data: mealsData } = await supabase
    .from('meals')
    .select('meal_date, calories, protein_g, carbs_g, fat_g')
    .eq('user_id', userId)
    .gte('meal_date', startDate.toISOString().split('T')[0]);

  // Group by date and calculate daily totals
  const dailyTotals = new Map<
    string,
    { calories: number; protein: number; carbs: number; fat: number }
  >();

  mealsData?.forEach((meal) => {
    const existing = dailyTotals.get(meal.meal_date) || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    dailyTotals.set(meal.meal_date, {
      calories: existing.calories + (meal.calories || 0),
      protein: existing.protein + (meal.protein_g || 0),
      carbs: existing.carbs + (meal.carbs_g || 0),
      fat: existing.fat + (meal.fat_g || 0),
    });
  });

  const daysWithData = dailyTotals.size;
  const totals = Array.from(dailyTotals.values()).reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // Get nutrition goals
  const { data: goals } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Calculate compliance (days where calories were within ±10% of goal)
  let daysOnTrack = 0;
  if (goals) {
    dailyTotals.forEach((day) => {
      const variance = Math.abs(day.calories - goals.daily_calories) / goals.daily_calories;
      if (variance <= 0.1) daysOnTrack++;
    });
  }

  return {
    total_meals_logged: totalMeals || 0,
    avg_calories_per_day: daysWithData ? Math.round(totals.calories / daysWithData) : 0,
    avg_protein_per_day: daysWithData ? Math.round(totals.protein / daysWithData) : 0,
    avg_carbs_per_day: daysWithData ? Math.round(totals.carbs / daysWithData) : 0,
    avg_fat_per_day: daysWithData ? Math.round(totals.fat / daysWithData) : 0,
    days_on_track: daysOnTrack,
    compliance_rate: daysWithData ? Math.round((daysOnTrack / daysWithData) * 100) : 0,
  };
}

/**
 * Get progress/body measurement statistics
 */
export async function getProgressStats(userId: string): Promise<ProgressStats> {
  const supabase = await createClient();

  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('weight_kg, body_fat_percentage, measurement_date, photos')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: true });

  if (!measurements || measurements.length === 0) {
    return {
      weight_change_kg: 0,
      weight_change_percent: 0,
      body_fat_change: 0,
      measurements_taken: 0,
      photos_uploaded: 0,
    };
  }

  const first = measurements[0];
  const latest = measurements[measurements.length - 1];

  const weightChange = latest.weight_kg && first.weight_kg ? latest.weight_kg - first.weight_kg : 0;

  const weightChangePercent = first.weight_kg ? (weightChange / first.weight_kg) * 100 : 0;

  const bodyFatChange =
    latest.body_fat_percentage && first.body_fat_percentage
      ? latest.body_fat_percentage - first.body_fat_percentage
      : 0;

  const photosUploaded = measurements.reduce((count, m) => {
    if (m.photos) {
      const photos = typeof m.photos === 'object' ? m.photos : {};
      return count + Object.keys(photos).length;
    }
    return count;
  }, 0);

  return {
    weight_change_kg: Math.round(weightChange * 10) / 10,
    weight_change_percent: Math.round(weightChangePercent * 10) / 10,
    body_fat_change: Math.round(bodyFatChange * 10) / 10,
    measurements_taken: measurements.length,
    photos_uploaded: photosUploaded,
  };
}

/**
 * Get workout time series data for charts
 */
export async function getWorkoutTimeSeries(
  userId: string,
  days: number = 30,
): Promise<TimeSeriesData[]> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: workouts } = await supabase
    .from('workout_sessions')
    .select('workout_date, calories_burned')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('workout_date', startDate.toISOString().split('T')[0])
    .order('workout_date', { ascending: true });

  // Group by date
  const dailyData = new Map<string, number>();

  workouts?.forEach((workout) => {
    const existing = dailyData.get(workout.workout_date) || 0;
    dailyData.set(workout.workout_date, existing + (workout.calories_burned || 0));
  });

  // Fill in missing dates with 0
  const result: TimeSeriesData[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    result.push({
      date: dateStr,
      value: dailyData.get(dateStr) || 0,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return result;
}

/**
 * Get nutrition time series data for charts
 */
export async function getNutritionTimeSeries(
  userId: string,
  days: number = 30,
): Promise<{
  calories: TimeSeriesData[];
  protein: TimeSeriesData[];
  carbs: TimeSeriesData[];
  fat: TimeSeriesData[];
}> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: meals } = await supabase
    .from('meals')
    .select('meal_date, calories, protein_g, carbs_g, fat_g')
    .eq('user_id', userId)
    .gte('meal_date', startDate.toISOString().split('T')[0])
    .order('meal_date', { ascending: true });

  // Group by date
  const dailyData = new Map<
    string,
    { calories: number; protein: number; carbs: number; fat: number }
  >();

  meals?.forEach((meal) => {
    const existing = dailyData.get(meal.meal_date) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    dailyData.set(meal.meal_date, {
      calories: existing.calories + (meal.calories || 0),
      protein: existing.protein + (meal.protein_g || 0),
      carbs: existing.carbs + (meal.carbs_g || 0),
      fat: existing.fat + (meal.fat_g || 0),
    });
  });

  // Fill in missing dates
  const calories: TimeSeriesData[] = [];
  const protein: TimeSeriesData[] = [];
  const carbs: TimeSeriesData[] = [];
  const fat: TimeSeriesData[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const data = dailyData.get(dateStr) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    calories.push({ date: dateStr, value: data.calories, label });
    protein.push({ date: dateStr, value: data.protein, label });
    carbs.push({ date: dateStr, value: data.carbs, label });
    fat.push({ date: dateStr, value: data.fat, label });
  }

  return { calories, protein, carbs, fat };
}

/**
 * Calculate current workout streak
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  for (const workoutDate of sortedDates) {
    const wd = new Date(workoutDate);
    wd.setHours(0, 0, 0, 0);

    if (wd.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (wd.getTime() < checkDate.getTime()) {
      const diffDays = Math.floor((checkDate.getTime() - wd.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) break;
      streak++;
      checkDate = new Date(wd);
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return streak;
}

/**
 * Calculate longest workout streak
 */
function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 1;
  let currentStreak = 1;
  let prevDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.floor(
      (sortedDates[i].getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }

    prevDate = sortedDates[i];
  }

  return longestStreak;
}
