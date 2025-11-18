'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Meal {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  consumed_at: string;
}

export function MealLogger({ userId, todayMeals }: { userId: string; todayMeals: Meal[] }) {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Insert meal
      const { error } = await supabase.from('meals').insert({
        user_id: userId,
        meal_name: mealName,
        calories: Number(calories),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fats_g: Number(fats),
        consumed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update nutrition streak
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_streak_type: 'nutrition',
        p_activity_date: today,
      });

      setSuccess(true);
      // Reset form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');

      // Reload page to show updated stats
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error logging meal:', error);
      alert('Failed to log meal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate macros from calories if needed
  const estimateMacros = () => {
    if (!calories) return;
    const cal = Number(calories);
    // Estimate: 30% protein, 40% carbs, 30% fats
    setProtein(String(Math.round((cal * 0.3) / 4)));
    setCarbs(String(Math.round((cal * 0.4) / 4)));
    setFats(String(Math.round((cal * 0.3) / 9)));
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Log Meal</h2>

      {/* Today's Meals Summary */}
      {todayMeals.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Today&apos;s Meals ({todayMeals.length}):
          </div>
          <div className="space-y-1">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="text-sm flex items-center justify-between">
                <span className="text-gray-700">
                  {new Date(meal.consumed_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  - {meal.meal_name}
                </span>
                <span className="font-medium">{meal.calories} cal</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Meal Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Meal Name</label>
          <input
            type="text"
            required
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="e.g., Chicken breast with rice"
            className="w-full px-3 py-2 border rounded-lg"
            list="common-meals"
          />
          <datalist id="common-meals">
            <option value="Chicken breast with rice" />
            <option value="Salmon with vegetables" />
            <option value="Greek yogurt with berries" />
            <option value="Protein shake" />
            <option value="Oatmeal with banana" />
            <option value="Eggs and toast" />
            <option value="Turkey sandwich" />
            <option value="Pasta with lean meat" />
          </datalist>
        </div>

        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Calories</label>
            <button
              type="button"
              onClick={estimateMacros}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Estimate macros
            </button>
          </div>
          <input
            type="number"
            required
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="500"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-blue-600">Protein (g)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="30"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">
              {protein ? `${Math.round(Number(protein) * 4)} cal` : '-'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-green-600">Carbs (g)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="50"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">
              {carbs ? `${Math.round(Number(carbs) * 4)} cal` : '-'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-yellow-600">Fats (g)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              placeholder="15"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">
              {fats ? `${Math.round(Number(fats) * 9)} cal` : '-'}
            </div>
          </div>
        </div>

        {/* Macro Totals Check */}
        {protein && carbs && fats && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            Macro calories: {Math.round(Number(protein) * 4 + Number(carbs) * 4 + Number(fats) * 9)}{' '}
            cal
            {calories &&
              Math.abs(
                Math.round(Number(protein) * 4 + Number(carbs) * 4 + Number(fats) * 9) -
                  Number(calories),
              ) > 20 && (
                <span className="text-yellow-600 ml-2">⚠️ Doesn&apos;t match total calories</span>
              )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Logging Meal...' : success ? '✅ Meal Logged!' : '🍽️ Log Meal'}
        </button>

        {success && (
          <div className="text-center text-green-600 text-sm">
            Meal logged successfully! Your nutrition streak has been updated.
          </div>
        )}
      </form>

      {/* Quick Tip */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        💡 <span className="font-medium">Pro Tip:</span> Use MyFitnessPal or nutrition labels to get
        accurate macro information
      </div>
    </div>
  );
}
