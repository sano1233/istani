import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dumbbell, TrendingUp, Target, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'
import { CoachingMessages } from '@/components/coaching-messages'
import { DailyCheckInTrigger } from '@/components/daily-checkin-modal'

export const metadata = {
  title: 'Dashboard - Istani Fitness',
  description: 'Your fitness dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent workouts
  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(5)

  // Fetch today's meals
  const today = new Date().toISOString().split('T')[0]
  const { data: todayMeals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)

  // Calculate today's nutrition totals
  const todayNutrition = todayMeals?.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein_g,
      carbs: acc.carbs + meal.carbs_g,
      fats: acc.fats + meal.fats_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fats: 0 }

  // Get latest body measurement
  const { data: latestMeasurement } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single()

  // Get recent coaching messages
  const { data: coachingMessages } = await supabase
    .from('coaching_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">
          Welcome back, {profile?.full_name || 'Athlete'}!
        </h1>
        <p className="text-gray-600">
          Here's your fitness overview for today
        </p>
      </div>

      {/* AI Coaching Messages */}
      {coachingMessages && coachingMessages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your AI Coach Says...</h2>
          <CoachingMessages messages={coachingMessages} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workouts This Week</p>
                <p className="text-3xl font-bold">{recentWorkouts?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-fitness-strength rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Calories Today</p>
                <p className="text-3xl font-bold">{todayNutrition.calories}</p>
              </div>
              <div className="w-12 h-12 bg-fitness-nutrition rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Weight</p>
                <p className="text-3xl font-bold">
                  {latestMeasurement?.weight_kg || profile?.current_weight_kg || '--'}
                  <span className="text-lg text-gray-600"> kg</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Goal Weight</p>
                <p className="text-3xl font-bold">
                  {profile?.target_weight_kg || '--'}
                  <span className="text-lg text-gray-600"> kg</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-secondary rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentWorkouts || recentWorkouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No workouts logged yet</p>
                <a href="/dashboard/workouts" className="text-brand-primary hover:underline mt-2 inline-block">
                  Log your first workout
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold capitalize">{workout.workout_type}</p>
                      <p className="text-sm text-gray-600">
                        {workout.duration_minutes} minutes • {workout.calories_burned || 0} cal
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(workout.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Calories</span>
                  <span className="font-semibold">{todayNutrition.calories} kcal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-primary h-2 rounded-full"
                    style={{ width: `${Math.min((todayNutrition.calories / 2000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Protein</span>
                  <span className="font-semibold">{todayNutrition.protein}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-fitness-strength h-2 rounded-full"
                    style={{ width: `${Math.min((todayNutrition.protein / 150) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Carbs</span>
                  <span className="font-semibold">{todayNutrition.carbs}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-fitness-cardio h-2 rounded-full"
                    style={{ width: `${Math.min((todayNutrition.carbs / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Fats</span>
                  <span className="font-semibold">{todayNutrition.fats}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-fitness-nutrition h-2 rounded-full"
                    style={{ width: `${Math.min((todayNutrition.fats / 65) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {(!todayMeals || todayMeals.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No meals logged today</p>
                  <a href="/dashboard/nutrition" className="text-brand-primary hover:underline text-sm mt-1 inline-block">
                    Log your first meal
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Check-In Trigger */}
      <DailyCheckInTrigger userId={user.id} />
    </div>
  )
}
