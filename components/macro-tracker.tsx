'use client';

interface MacroTrackerProps {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  streak: {
    current_streak: number;
    longest_streak: number;
  } | null;
}

export function MacroTracker({ current, targets, streak }: MacroTrackerProps) {
  const calculatePercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const caloriesPercent = calculatePercentage(current.calories, targets.calories);
  const proteinPercent = calculatePercentage(current.protein, targets.protein);
  const carbsPercent = calculatePercentage(current.carbs, targets.carbs);
  const fatsPercent = calculatePercentage(current.fats, targets.fats);

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Today's Nutrition</h2>
          <p className="text-sm text-gray-600">Track your macros and stay on target</p>
        </div>
        {streak && streak.current_streak > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold">{streak.current_streak} 🔥</div>
            <div className="text-xs text-gray-600">Day streak</div>
          </div>
        )}
      </div>

      {/* Calories - Large Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Calories</span>
          <span className="text-sm font-semibold">
            {current.calories} / {targets.calories} cal
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${getProgressColor(caloriesPercent)}`}
            style={{ width: `${caloriesPercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-1 text-right">
          {caloriesPercent}% of daily goal
        </div>
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Protein */}
        <div>
          <div className="text-center mb-2">
            <div className="text-xs font-medium text-blue-600 mb-1">PROTEIN</div>
            <div className="text-2xl font-bold">{current.protein}g</div>
            <div className="text-xs text-gray-600">/ {targets.protein}g</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <div className="text-xs text-center text-gray-600 mt-1">{proteinPercent}%</div>
        </div>

        {/* Carbs */}
        <div>
          <div className="text-center mb-2">
            <div className="text-xs font-medium text-green-600 mb-1">CARBS</div>
            <div className="text-2xl font-bold">{current.carbs}g</div>
            <div className="text-xs text-gray-600">/ {targets.carbs}g</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
          <div className="text-xs text-center text-gray-600 mt-1">{carbsPercent}%</div>
        </div>

        {/* Fats */}
        <div>
          <div className="text-center mb-2">
            <div className="text-xs font-medium text-yellow-600 mb-1">FATS</div>
            <div className="text-2xl font-bold">{current.fats}g</div>
            <div className="text-xs text-gray-600">/ {targets.fats}g</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-yellow-500 transition-all"
              style={{ width: `${fatsPercent}%` }}
            />
          </div>
          <div className="text-xs text-center text-gray-600 mt-1">{fatsPercent}%</div>
        </div>
      </div>

      {/* Remaining Calories */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Remaining</span>
          <span className="text-lg font-semibold">
            {Math.max(0, targets.calories - current.calories)} cal
          </span>
        </div>
        {current.calories >= targets.calories && (
          <div className="mt-2 text-xs text-green-600 text-center">
            ✅ Daily calorie goal reached!
          </div>
        )}
      </div>
    </div>
  );
}
