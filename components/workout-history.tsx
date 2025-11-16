'use client'

interface Workout {
  id: string
  workout_type: string
  duration_minutes: number
  completed_at: string
}

const WORKOUT_EMOJIS: Record<string, string> = {
  strength: '💪',
  cardio: '🏃',
  yoga: '🧘',
  hiit: '🔥',
  sports: '⚽',
  other: '🎯',
}

export function WorkoutHistory({ workouts }: { workouts: Workout[] }) {
  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-3">🏋️</div>
          <p>No workouts logged yet</p>
          <p className="text-sm mt-1">Start by logging your first workout above!</p>
        </div>
      </div>
    )
  }

  // Group workouts by date
  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const date = new Date(workout.completed_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(workout)
    return acc
  }, {} as Record<string, Workout[]>)

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>

      <div className="space-y-6">
        {Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
            <div className="space-y-2">
              {dayWorkouts.map(workout => (
                <div
                  key={workout.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl">
                    {WORKOUT_EMOJIS[workout.workout_type] || '🎯'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">
                      {workout.workout_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {workout.duration_minutes} minutes
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(workout.completed_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {workouts.length >= 20 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing last 20 workouts
        </div>
      )}
    </div>
  )
}
