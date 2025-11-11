import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkoutLogger } from '@/components/workout-logger'
import { WorkoutHistory } from '@/components/workout-history'
import { WorkoutRecommendations } from '@/components/workout-recommendations'

export default async function WorkoutsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get today's workouts
  const today = new Date().toISOString().split('T')[0]
  const { data: todayWorkouts } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*)')
    .eq('user_id', user.id)
    .gte('completed_at', today)
    .order('completed_at', { ascending: false })

  // Get recent workout history (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', thirtyDaysAgo.toISOString())
    .order('completed_at', { ascending: false })
    .limit(20)

  // Get AI workout recommendations
  const { data: recommendations } = await supabase
    .from('workout_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get user's workout streak
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .eq('streak_type', 'workout')
    .single()

  // Calculate this week's workout count
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekWorkouts = recentWorkouts?.filter(w =>
    new Date(w.completed_at) >= weekStart
  ).length || 0

  // Calculate total workouts
  const { count: totalWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workouts</h1>
            <p className="text-muted-foreground mt-1">
              Track your training and view AI-powered recommendations
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground">Current Streak</div>
            <div className="text-3xl font-bold mt-2">
              {streak?.current_streak || 0} 🔥
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Best: {streak?.longest_streak || 0} days
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground">This Week</div>
            <div className="text-3xl font-bold mt-2">{weekWorkouts}</div>
            <div className="text-xs text-muted-foreground mt-1">
              workouts completed
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Workouts</div>
            <div className="text-3xl font-bold mt-2">{totalWorkouts || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              all time
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground">Today</div>
            <div className="text-3xl font-bold mt-2">{todayWorkouts?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {todayWorkouts?.length ? '✅ completed' : '📝 pending'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workout Logger - Takes 2 columns */}
          <div className="lg:col-span-2">
            <WorkoutLogger userId={user.id} />
          </div>

          {/* AI Recommendations - Takes 1 column */}
          <div>
            <WorkoutRecommendations
              recommendations={recommendations || []}
              userId={user.id}
            />
          </div>
        </div>

        {/* Workout History */}
        <WorkoutHistory workouts={recentWorkouts || []} />
      </div>
    </div>
  )
}
