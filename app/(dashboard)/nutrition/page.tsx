import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MealLogger } from '@/components/meal-logger';
import { MacroTracker } from '@/components/macro-tracker';
import { NutritionRecommendations } from '@/components/nutrition-recommendations';
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
} from '@/lib/fitness-calculations';

export default async function NutritionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile for macro calculations
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Calculate daily macro targets
  let macroTargets = { protein: 150, carbs: 200, fats: 60, calories: 2000 };
  if (profile?.current_weight_kg && profile?.height_cm && profile?.age) {
    // Map profile goals to fitness calculation goals
    const goalMap: Record<
      string,
      'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance'
    > = {
      fat_loss: 'weight_loss',
      muscle_gain: 'muscle_gain',
      maintain_weight: 'maintenance',
      improve_endurance: 'athletic_performance',
      general_fitness: 'maintenance',
    };
    const fitnessGoal = goalMap[profile.primary_goal || 'maintain_weight'] || 'maintenance';

    // Calculate BMR, TDEE, and calorie target
    const bmr = calculateBMR(
      profile.current_weight_kg,
      profile.height_cm,
      profile.age,
      profile.gender || 'male',
    );
    const tdee = calculateTDEE(bmr, profile.activity_level || 'moderate');
    const calorieTarget = calculateCalorieTarget(tdee, fitnessGoal);

    // Calculate macros
    const macros = calculateMacros(calorieTarget, fitnessGoal, profile.current_weight_kg);

    macroTargets = {
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
      calories: calorieTarget,
    };
  }

  // Get today's meals
  const today = new Date().toISOString().split('T')[0];
  const { data: todayMeals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('consumed_at', today)
    .order('consumed_at', { ascending: true });

  // Calculate today's totals
  const todayTotals = todayMeals?.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_g || 0),
      carbs: acc.carbs + (meal.carbs_g || 0),
      fats: acc.fats + (meal.fats_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  ) || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  // Get recent meals (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentMeals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('consumed_at', sevenDaysAgo.toISOString())
    .order('consumed_at', { ascending: false })
    .limit(30);

  // Get AI nutrition recommendations
  const { data: recommendations } = await supabase
    .from('nutrition_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // Get nutrition streak
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .eq('streak_type', 'nutrition')
    .single();

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nutrition</h1>
            <p className="text-muted-foreground mt-1">
              Track your meals and optimize your nutrition with AI guidance
            </p>
          </div>
        </div>

        {/* Today's Macro Progress */}
        <MacroTracker current={todayTotals} targets={macroTargets} streak={streak} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meal Logger - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <MealLogger userId={user.id} todayMeals={todayMeals || []} />

            {/* Recent Meals */}
            {recentMeals && recentMeals.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Meals (7 Days)</h2>
                <div className="space-y-2">
                  {recentMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">{meal.meal_name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(meal.consumed_at).toLocaleDateString()} at{' '}
                          {new Date(meal.consumed_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{meal.calories} cal</div>
                        <div className="text-xs text-gray-600">
                          P: {meal.protein_g}g | C: {meal.carbs_g}g | F: {meal.fats_g}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations - Takes 1 column */}
          <div>
            <NutritionRecommendations recommendations={recommendations || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
