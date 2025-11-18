'use client'

interface NutritionRecommendation {
  id: string
  meal_type: string
  suggestions: string[]
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
  reason: string
  created_at: string
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
  'pre-workout': '💪',
  'post-workout': '🥤',
}

export function NutritionRecommendations({
  recommendations,
}: {
  recommendations: NutritionRecommendation[];
}) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-3">AI Meal Plans</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🤖</div>
          <p className="text-sm">No meal plans yet</p>
          <p className="text-xs mt-1">
            Our AI will create personalized meal recommendations based on your goals
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI Meal Plans</h2>
        <span className="text-xs text-gray-500">
          {recommendations.length} available
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-2xl">
                  {MEAL_EMOJIS[rec.meal_type] || '🍽️'}
                </div>
                <div>
                  <div className="font-medium capitalize">
                    {rec.meal_type.replace('_', ' ').replace('-', ' ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rec.target_calories} cal
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>P: {rec.target_protein_g}g</div>
                <div>C: {rec.target_carbs_g}g</div>
                <div>F: {rec.target_fats_g}g</div>
              </div>
            </div>

            {/* Reason */}
            <p className="text-sm text-gray-700 mb-3">
              {rec.reason}
            </p>

            {/* Suggestions */}
            {rec.suggestions && rec.suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-600">Meal Ideas:</div>
                <ul className="text-xs space-y-1">
                  {rec.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-500">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(rec.created_at).toLocaleDateString()}
              </span>
              <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                Use this plan →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-center text-gray-500">
        💡 AI creates personalized meal plans based on your goals and progress
      </div>
    </div>
  )
}
