import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { LineChart } from '@/components/analytics/line-chart';
import { BarChart } from '@/components/analytics/bar-chart';
import {
  getWorkoutStats,
  getNutritionStats,
  getProgressStats,
  getWorkoutTimeSeries,
  getNutritionTimeSeries,
} from '@/lib/analytics';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Load all analytics data
  const [workoutStats, nutritionStats, progressStats, workoutTimeSeries, nutritionTimeSeries] =
    await Promise.all([
      getWorkoutStats(user.id, 30),
      getNutritionStats(user.id, 30),
      getProgressStats(user.id),
      getWorkoutTimeSeries(user.id, 30),
      getNutritionTimeSeries(user.id, 30),
    ]);

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/60">Track your progress and insights over time</p>
        </div>

        {/* Workout Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Workout Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{workoutStats.total_workouts}</p>
              <p className="text-white/60 text-sm">Total Workouts</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{workoutStats.this_week}</p>
              <p className="text-white/60 text-sm">This Week</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{workoutStats.this_month}</p>
              <p className="text-white/60 text-sm">This Month</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{workoutStats.current_streak}</p>
              <p className="text-white/60 text-sm">Current Streak</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{workoutStats.longest_streak}</p>
              <p className="text-white/60 text-sm">Longest Streak</p>
            </Card>
            <Card className="p-4 text-center">
              <p
                className={`text-3xl font-bold ${workoutStats.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {workoutStats.growth_rate > 0 && '+'}
                {workoutStats.growth_rate}%
              </p>
              <p className="text-white/60 text-sm">Growth Rate</p>
            </Card>
          </div>

          {/* Workout Trend Chart */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Calories Burned (30 Days)</h3>
            <LineChart
              data={workoutTimeSeries}
              color="#00ffff"
              height={250}
              showGrid
              showDots
              smooth
            />
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">
                  {workoutStats.total_calories.toLocaleString()}
                </p>
                <p className="text-white/60 text-sm">Total Calories Burned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{workoutStats.avg_duration_minutes}</p>
                <p className="text-white/60 text-sm">Avg Duration (min)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Nutrition Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Nutrition Tracking</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{nutritionStats.total_meals_logged}</p>
              <p className="text-white/60 text-sm">Meals Logged</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{nutritionStats.avg_calories_per_day}</p>
              <p className="text-white/60 text-sm">Avg Calories/Day</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{nutritionStats.days_on_track}</p>
              <p className="text-white/60 text-sm">Days On Track</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{nutritionStats.compliance_rate}%</p>
              <p className="text-white/60 text-sm">Compliance Rate</p>
            </Card>
          </div>

          {/* Nutrition Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Daily Calories (30 Days)</h3>
              <LineChart
                data={nutritionTimeSeries.calories}
                color="#10b981"
                height={200}
                showGrid
                smooth
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Macro Averages (30 Days)</h3>
              <BarChart
                data={[
                  {
                    label: 'Protein',
                    value: nutritionStats.avg_protein_per_day,
                    color: '#ef4444',
                  },
                  {
                    label: 'Carbs',
                    value: nutritionStats.avg_carbs_per_day,
                    color: '#f59e0b',
                  },
                  { label: 'Fat', value: nutritionStats.avg_fat_per_day, color: '#8b5cf6' },
                ]}
                height={200}
              />
            </Card>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Body Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 text-center">
              <p
                className={`text-3xl font-bold ${progressStats.weight_change_kg < 0 ? 'text-green-500' : progressStats.weight_change_kg > 0 ? 'text-red-500' : 'text-white'}`}
              >
                {progressStats.weight_change_kg > 0 && '+'}
                {progressStats.weight_change_kg} kg
              </p>
              <p className="text-white/60 text-sm">Weight Change</p>
            </Card>
            <Card className="p-4 text-center">
              <p
                className={`text-3xl font-bold ${progressStats.weight_change_percent < 0 ? 'text-green-500' : progressStats.weight_change_percent > 0 ? 'text-red-500' : 'text-white'}`}
              >
                {progressStats.weight_change_percent > 0 && '+'}
                {progressStats.weight_change_percent}%
              </p>
              <p className="text-white/60 text-sm">Weight %</p>
            </Card>
            <Card className="p-4 text-center">
              <p
                className={`text-3xl font-bold ${progressStats.body_fat_change < 0 ? 'text-green-500' : progressStats.body_fat_change > 0 ? 'text-red-500' : 'text-white'}`}
              >
                {progressStats.body_fat_change > 0 && '+'}
                {progressStats.body_fat_change}%
              </p>
              <p className="text-white/60 text-sm">Body Fat Change</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{progressStats.measurements_taken}</p>
              <p className="text-white/60 text-sm">Measurements</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{progressStats.photos_uploaded}</p>
              <p className="text-white/60 text-sm">Photos</p>
            </Card>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Insights & Recommendations</h2>
          <div className="space-y-4">
            {workoutStats.current_streak >= 7 && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <div>
                  <p className="text-white font-semibold">Excellent Consistency!</p>
                  <p className="text-white/60 text-sm">
                    You've maintained a {workoutStats.current_streak}-day workout streak. Keep it
                    up!
                  </p>
                </div>
              </div>
            )}

            {workoutStats.current_streak === 0 && workoutStats.longest_streak > 0 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <span className="material-symbols-outlined text-yellow-500">warning</span>
                <div>
                  <p className="text-white font-semibold">Streak Broken</p>
                  <p className="text-white/60 text-sm">
                    Your {workoutStats.longest_streak}-day streak has ended. Start a new one today!
                  </p>
                </div>
              </div>
            )}

            {nutritionStats.compliance_rate >= 80 && (
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <span className="material-symbols-outlined text-blue-500">restaurant</span>
                <div>
                  <p className="text-white font-semibold">Great Nutrition Tracking!</p>
                  <p className="text-white/60 text-sm">
                    {nutritionStats.compliance_rate}% compliance rate shows excellent commitment to
                    your nutrition goals.
                  </p>
                </div>
              </div>
            )}

            {workoutStats.growth_rate > 20 && (
              <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <span className="material-symbols-outlined text-purple-500">trending_up</span>
                <div>
                  <p className="text-white font-semibold">Outstanding Growth!</p>
                  <p className="text-white/60 text-sm">
                    Your workout frequency increased by {workoutStats.growth_rate}% this month.
                    Amazing progress!
                  </p>
                </div>
              </div>
            )}

            {progressStats.weight_change_kg !== 0 && (
              <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <span className="material-symbols-outlined text-primary">scale</span>
                <div>
                  <p className="text-white font-semibold">Weight Progress Tracked</p>
                  <p className="text-white/60 text-sm">
                    You've recorded {progressStats.measurements_taken} measurements. Consistency in
                    tracking leads to better results!
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
