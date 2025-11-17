'use client';

import { useState } from 'react';
import { Plus, Save, X, Info } from 'lucide-react';
import { FoodSearch } from './food-search';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import type { FoodNutrition } from '@/lib/usda-api';
import { createClient } from '@/lib/supabase/client';

interface MealItem {
  food: FoodNutrition;
  servingAmount: number;
  servingUnit: string;
}

interface EnhancedMealLoggerProps {
  onMealLogged?: () => void;
}

export function EnhancedMealLogger({ onMealLogged }: EnhancedMealLoggerProps) {
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleFoodSelect = (food: FoodNutrition) => {
    const newItem: MealItem = {
      food,
      servingAmount: food.servingSize || 100,
      servingUnit: food.servingUnit || 'g',
    };

    if (currentEditIndex !== null) {
      const updated = [...mealItems];
      updated[currentEditIndex] = newItem;
      setMealItems(updated);
      setCurrentEditIndex(null);
    } else {
      setMealItems([...mealItems, newItem]);
    }

    setShowFoodSearch(false);
  };

  const updateServingAmount = (index: number, amount: number) => {
    const updated = [...mealItems];
    updated[index].servingAmount = amount;
    setMealItems(updated);
  };

  const removeItem = (index: number) => {
    setMealItems(mealItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      // Micronutrients
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
    };

    mealItems.forEach(item => {
      const multiplier = item.servingAmount / (item.food.servingSize || 100);

      totals.calories += (item.food.calories || 0) * multiplier;
      totals.protein += (item.food.protein || 0) * multiplier;
      totals.carbs += (item.food.carbs || 0) * multiplier;
      totals.fat += (item.food.fat || 0) * multiplier;
      totals.fiber += (item.food.fiber || 0) * multiplier;
      totals.sugar += (item.food.sugar || 0) * multiplier;
      totals.sodium += (item.food.sodium || 0) * multiplier;

      totals.vitaminA += (item.food.vitaminA || 0) * multiplier;
      totals.vitaminC += (item.food.vitaminC || 0) * multiplier;
      totals.vitaminD += (item.food.vitaminD || 0) * multiplier;
      totals.calcium += (item.food.calcium || 0) * multiplier;
      totals.iron += (item.food.iron || 0) * multiplier;
      totals.potassium += (item.food.potassium || 0) * multiplier;
    });

    return totals;
  };

  const handleSaveMeal = async () => {
    if (mealItems.length === 0) {
      setError('Please add at least one food item');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totals = calculateTotals();

      // Save meal
      const { error: mealError } = await supabase.from('meals').insert({
        user_id: user.id,
        meal_type: mealType,
        meal_name: mealName || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        fiber: Math.round(totals.fiber || 0),
        notes: mealItems.map(item =>
          `${item.food.description} (${item.servingAmount}${item.servingUnit})`
        ).join(', '),
      });

      if (mealError) throw mealError;

      // Save/update micronutrient intake for today
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('micronutrient_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const microData = {
        user_id: user.id,
        date: today,
        vitamin_a_mcg: (existing?.vitamin_a_mcg || 0) + totals.vitaminA,
        vitamin_c_mg: (existing?.vitamin_c_mg || 0) + totals.vitaminC,
        vitamin_d_mcg: (existing?.vitamin_d_mcg || 0) + totals.vitaminD,
        calcium_mg: (existing?.calcium_mg || 0) + totals.calcium,
        iron_mg: (existing?.iron_mg || 0) + totals.iron,
        potassium_mg: (existing?.potassium_mg || 0) + totals.potassium,
        fiber_g: (existing?.fiber_g || 0) + totals.fiber,
        sugar_g: (existing?.sugar_g || 0) + totals.sugar,
      };

      if (existing) {
        await supabase
          .from('micronutrient_intake')
          .update(microData)
          .eq('user_id', user.id)
          .eq('date', today);
      } else {
        await supabase.from('micronutrient_intake').insert(microData);
      }

      // Reset form
      setMealName('');
      setMealItems([]);
      setShowFoodSearch(false);

      if (onMealLogged) onMealLogged();
    } catch (err: any) {
      console.error('Error saving meal:', err);
      setError(err.message || 'Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Log Meal</h3>

        {/* Meal Type Selection */}
        <div className="flex gap-2 mb-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mealType === type
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Optional Meal Name */}
        <Input
          type="text"
          placeholder="Meal name (optional)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="mb-4"
        />
      </div>

      {/* Food Search */}
      {showFoodSearch ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Add Food</h4>
            <button
              onClick={() => {
                setShowFoodSearch(false);
                setCurrentEditIndex(null);
              }}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FoodSearch onFoodSelect={handleFoodSelect} />
        </div>
      ) : (
        <Button
          onClick={() => setShowFoodSearch(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Food Item
        </Button>
      )}

      {/* Meal Items List */}
      {mealItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Items ({mealItems.length})</h4>

          {mealItems.map((item, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-white">{item.food.description}</p>
                  {item.food.brandName && (
                    <p className="text-sm text-white/60">{item.food.brandName}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="text-white/40 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={item.servingAmount}
                  onChange={(e) => updateServingAmount(index, parseFloat(e.target.value) || 0)}
                  className="w-24"
                  min="0"
                  step="0.1"
                />
                <span className="text-white/60">{item.servingUnit}</span>
              </div>

              <div className="text-sm text-white/80">
                {Math.round((item.food.calories || 0) * (item.servingAmount / (item.food.servingSize || 100)))} cal •{' '}
                {Math.round((item.food.protein || 0) * (item.servingAmount / (item.food.servingSize || 100)))}g protein •{' '}
                {Math.round((item.food.carbs || 0) * (item.servingAmount / (item.food.servingSize || 100)))}g carbs •{' '}
                {Math.round((item.food.fat || 0) * (item.servingAmount / (item.food.servingSize || 100)))}g fat
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      {mealItems.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-white">Meal Totals</h4>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/60">Calories</p>
              <p className="text-xl font-bold text-white">{Math.round(totals.calories)}</p>
            </div>
            <div>
              <p className="text-white/60">Protein</p>
              <p className="text-xl font-bold text-primary">{Math.round(totals.protein)}g</p>
            </div>
            <div>
              <p className="text-white/60">Carbs</p>
              <p className="text-lg font-semibold text-white">{Math.round(totals.carbs)}g</p>
            </div>
            <div>
              <p className="text-white/60">Fat</p>
              <p className="text-lg font-semibold text-white">{Math.round(totals.fat)}g</p>
            </div>
          </div>

          {/* Micronutrients Preview */}
          {(totals.vitaminA > 0 || totals.vitaminC > 0 || totals.calcium > 0) && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-white/60 mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Key Micronutrients
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {totals.vitaminC > 0 && (
                  <div>
                    <p className="text-white/60">Vitamin C</p>
                    <p className="font-semibold text-white">{Math.round(totals.vitaminC)}mg</p>
                  </div>
                )}
                {totals.calcium > 0 && (
                  <div>
                    <p className="text-white/60">Calcium</p>
                    <p className="font-semibold text-white">{Math.round(totals.calcium)}mg</p>
                  </div>
                )}
                {totals.iron > 0 && (
                  <div>
                    <p className="text-white/60">Iron</p>
                    <p className="font-semibold text-white">{Math.round(totals.iron)}mg</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Save Button */}
      {mealItems.length > 0 && (
        <Button
          onClick={handleSaveMeal}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Meal
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
