import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressChart } from '@/components/progress-chart'
import { ProgressPhotos } from '@/components/progress-photos'
import { AchievementsList } from '@/components/achievements-list'

export const metadata = {
  title: 'Progress Tracking - Istani Fitness',
  description: 'Track your fitness journey with detailed analytics',
}

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get last 90 days of measurements
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', user.id)
    .gte('measured_at', ninetyDaysAgo.toISOString())
    .order('measured_at', { ascending: true })

  // Get progress photos
  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: false })
    .limit(12)

  // Get achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (*)
    `)
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('earned_at', { ascending: false })

  // Get all streaks
  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)

  // Calculate statistics
  const latestMeasurement = measurements?.[measurements.length - 1]
  const firstMeasurement = measurements?.[0]

  const weightChange = latestMeasurement && firstMeasurement
    ? latestMeasurement.weight_kg - firstMeasurement.weight_kg
    : 0

  const bodyFatChange = latestMeasurement && firstMeasurement
    ? latestMeasurement.body_fat_percentage - firstMeasurement.body_fat_percentage
    : 0

  // Get workout count
  const { count: workoutCount } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const workoutStreak = streaks?.find(s => s.streak_type === 'workout')
  const waterStreak = streaks?.find(s => s.streak_type === 'water')
  const nutritionStreak = streaks?.find(s => s.streak_type === 'nutrition')

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Progress Tracking</h1>
          <p className="text-white/60">
            Visualize your fitness journey and celebrate your wins
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Weight Change</span>
                <span className="material-symbols-outlined text-primary">
                  trending_down
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {weightChange !== 0 ? (weightChange > 0 ? '+' : '') + weightChange.toFixed(1) : '--'}
                <span className="text-lg text-white/60">kg</span>
              </p>
              <p className="text-sm text-white/60">Last 90 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Body Fat Change</span>
                <span className="material-symbols-outlined text-primary">
                  percent
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {bodyFatChange !== 0 ? (bodyFatChange > 0 ? '+' : '') + bodyFatChange.toFixed(1) : '--'}
                <span className="text-lg text-white/60">%</span>
              </p>
              <p className="text-sm text-white/60">Last 90 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Total Workouts</span>
                <span className="material-symbols-outlined text-primary">
                  fitness_center
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {workoutCount || 0}
              </p>
              <p className="text-sm text-white/60">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Achievements</span>
                <span className="material-symbols-outlined text-primary">
                  emoji_events
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {userAchievements?.length || 0}
              </p>
              <p className="text-sm text-white/60">Unlocked</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Streaks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Streaks 🔥</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <span className="material-symbols-outlined text-fitness-strength text-4xl">
                  fitness_center
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {workoutStreak?.current_streak || 0} days
                  </p>
                  <p className="text-sm text-white/60">
                    Workout Streak
                  </p>
                  <p className="text-xs text-white/40">
                    Best: {workoutStreak?.longest_streak || 0} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <span className="material-symbols-outlined text-primary text-4xl">
                  water_drop
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {waterStreak?.current_streak || 0} days
                  </p>
                  <p className="text-sm text-white/60">
                    Hydration Streak
                  </p>
                  <p className="text-xs text-white/40">
                    Best: {waterStreak?.longest_streak || 0} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                <span className="material-symbols-outlined text-fitness-nutrition text-4xl">
                  restaurant
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {nutritionStreak?.current_streak || 0} days
                  </p>
                  <p className="text-sm text-white/60">
                    Nutrition Streak
                  </p>
                  <p className="text-xs text-white/40">
                    Best: {nutritionStreak?.longest_streak || 0} days
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ProgressChart
            title="Weight Progress"
            data={measurements || []}
            dataKey="weight_kg"
            unit="kg"
            color="#0df259"
            target={profile?.target_weight_kg}
          />

          <ProgressChart
            title="Body Fat %"
            data={measurements || []}
            dataKey="body_fat_percentage"
            unit="%"
            color="#FF6B35"
          />
        </div>

        {/* Progress Photos */}
        <ProgressPhotos photos={photos || []} userId={user.id} />

        {/* Achievements */}
        <AchievementsList achievements={userAchievements || []} />

        {/* Goal Progress */}
        {profile?.target_weight_kg && latestMeasurement && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">
                      Current: {latestMeasurement.weight_kg}kg
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Target: {profile.target_weight_kg}kg
                    </span>
                  </div>

                  {(() => {
                    const start = firstMeasurement?.weight_kg || latestMeasurement.weight_kg
                    const current = latestMeasurement.weight_kg
                    const target = profile.target_weight_kg
                    const totalChange = Math.abs(target - start)
                    const currentProgress = Math.abs(current - start)
                    const percentage = totalChange > 0 ? (currentProgress / totalChange) * 100 : 0

                    return (
                      <>
                        <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm text-white/60 mt-2">
                          {percentage.toFixed(1)}% to goal • {Math.abs(target - current).toFixed(1)}kg remaining
                        </p>
                      </>
                    )
                  })()}
                </div>

                {profile.target_date && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">
                      Target Date: {new Date(profile.target_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {(() => {
                      const daysRemaining = Math.ceil(
                        (new Date(profile.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                      return (
                        <p className="text-sm text-white/60">
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Target date passed'}
                        </p>
                      )
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
