'use client';

interface WorkoutRecommendation {
  id: string;
  workout_type: string;
  exercises: string[];
  duration_minutes: number;
  difficulty_level: string;
  reason: string;
  created_at: string;
}

const WORKOUT_EMOJIS: Record<string, string> = {
  strength: '💪',
  cardio: '🏃',
  yoga: '🧘',
  hiit: '🔥',
  sports: '⚽',
  other: '🎯',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export function WorkoutRecommendations({
  recommendations,
  userId: _userId,
}: {
  recommendations: WorkoutRecommendation[];
  userId: string;
}) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-3">AI Recommendations</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🤖</div>
          <p className="text-sm">No recommendations yet</p>
          <p className="text-xs mt-1">
            Our AI will analyze your workouts and suggest personalized plans
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI Recommendations</h2>
        <span className="text-xs text-gray-500">{recommendations.length} available</span>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{WORKOUT_EMOJIS[rec.workout_type] || '🎯'}</div>
                <div>
                  <div className="font-medium capitalize">{rec.workout_type.replace('_', ' ')}</div>
                  <div className="text-xs text-gray-500">{rec.duration_minutes} min</div>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  DIFFICULTY_COLORS[rec.difficulty_level] || 'bg-gray-100'
                }`}
              >
                {rec.difficulty_level}
              </span>
            </div>

            {/* Reason */}
            <p className="text-sm text-gray-700 mb-3">{rec.reason}</p>

            {/* Exercises */}
            {rec.exercises && rec.exercises.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Exercises:</div>
                <ul className="text-xs space-y-1">
                  {rec.exercises.slice(0, 5).map((exercise, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      <span>{exercise}</span>
                    </li>
                  ))}
                  {rec.exercises.length > 5 && (
                    <li className="text-gray-500">+{rec.exercises.length - 5} more exercises</li>
                  )}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(rec.created_at).toLocaleDateString()}
              </span>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Use this plan →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-center text-gray-500">
        💡 AI analyzes your progress daily to suggest optimal workouts
      </div>
    </div>
  );
}
