'use client';

import { useState } from 'react';
import { Plus, Save, X, ChefHat, Clock, Users, Trash2 } from 'lucide-react';
import { FoodSearch } from './food-search';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import type { FoodNutrition } from '@/lib/usda-api';
import { createClient } from '@/lib/supabase/client';

interface RecipeIngredient {
  food: FoodNutrition;
  amount: number;
  unit: string;
  notes?: string;
}

export function RecipeBuilder() {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(1);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'>('lunch');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const supabase = createClient();

  const handleFoodSelect = (food: FoodNutrition) => {
    const newIngredient: RecipeIngredient = {
      food,
      amount: food.servingSize || 100,
      unit: food.servingUnit || 'g',
    };

    if (currentEditIndex !== null) {
      const updated = [...ingredients];
      updated[currentEditIndex] = newIngredient;
      setIngredients(updated);
      setCurrentEditIndex(null);
    } else {
      setIngredients([...ingredients, newIngredient]);
    }

    setShowFoodSearch(false);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const calculateNutritionPerServing = () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 0,
    };

    ingredients.forEach(ing => {
      const multiplier = ing.amount / (ing.food.servingSize || 100);

      totals.calories += (ing.food.calories || 0) * multiplier;
      totals.protein += (ing.food.protein || 0) * multiplier;
      totals.carbs += (ing.food.carbs || 0) * multiplier;
      totals.fat += (ing.food.fat || 0) * multiplier;
      totals.fiber += (ing.food.fiber || 0) * multiplier;
      totals.sugar += (ing.food.sugar || 0) * multiplier;
      totals.sodium += (ing.food.sodium || 0) * multiplier;
      totals.vitaminC += (ing.food.vitaminC || 0) * multiplier;
      totals.calcium += (ing.food.calcium || 0) * multiplier;
      totals.iron += (ing.food.iron || 0) * multiplier;
    });

    // Divide by servings
    Object.keys(totals).forEach(key => {
      totals[key as keyof typeof totals] /= servings;
    });

    return totals;
  };

  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) {
      setError('Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const nutrition = calculateNutritionPerServing();

      // Save recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          name: recipeName,
          description,
          servings,
          prep_time_minutes: prepTime || null,
          cook_time_minutes: cookTime || null,
          difficulty,
          meal_type: mealType,
          instructions: instructions.filter(i => i.trim()),
          calories_per_serving: Math.round(nutrition.calories),
          protein_per_serving: Math.round(nutrition.protein),
          carbs_per_serving: Math.round(nutrition.carbs),
          fat_per_serving: Math.round(nutrition.fat),
          fiber_per_serving: Math.round(nutrition.fiber),
          is_public: isPublic,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Save ingredients
      const ingredientsData = ingredients.map((ing, index) => ({
        recipe_id: recipe.id,
        fdc_id: ing.food.fdcId,
        amount: ing.amount,
        unit: ing.unit,
        notes: ing.notes || null,
        order_index: index,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsData);

      if (ingredientsError) throw ingredientsError;

      // Reset form
      setRecipeName('');
      setDescription('');
      setServings(1);
      setPrepTime(0);
      setCookTime(0);
      setIngredients([]);
      setInstructions(['']);
      setIsPublic(false);

      alert('Recipe saved successfully!');
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      setError(err.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const nutrition = calculateNutritionPerServing();
  const totalTime = prepTime + cookTime;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <ChefHat className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-white">Create Recipe</h3>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Recipe name *"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          className="text-lg font-semibold"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary resize-none"
          rows={3}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Servings</label>
            <Input
              type="number"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1 block">Prep (min)</label>
            <Input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1 block">Cook (min)</label>
            <Input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1 block">Total</label>
            <div className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1 block">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-white/80">Make this recipe public (share with community)</span>
        </label>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">Ingredients ({ingredients.length})</h4>
          {!showFoodSearch && (
            <Button
              onClick={() => setShowFoodSearch(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        {showFoodSearch ? (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/80">Search for ingredient</span>
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
          ingredients.length > 0 && (
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-white">{ing.food.description}</p>
                      {ing.food.brandName && (
                        <p className="text-sm text-white/60">{ing.food.brandName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-white/40 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-24"
                      min="0"
                      step="0.1"
                    />
                    <Input
                      type="text"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-20"
                      placeholder="unit"
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">Instructions</h4>
          <Button onClick={addInstruction} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Step
          </Button>
        </div>

        <div className="space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center mt-2">
                {index + 1}
              </span>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary resize-none"
                rows={2}
              />
              {instructions.length > 1 && (
                <button
                  onClick={() => removeInstruction(index)}
                  className="flex-shrink-0 text-white/40 hover:text-red-400 mt-2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Info (Auto-Calculated) */}
      {ingredients.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Nutrition per Serving (Auto-Calculated)
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white/60">Calories</p>
              <p className="text-xl font-bold text-white">{Math.round(nutrition.calories)}</p>
            </div>
            <div>
              <p className="text-white/60">Protein</p>
              <p className="text-lg font-semibold text-primary">{Math.round(nutrition.protein)}g</p>
            </div>
            <div>
              <p className="text-white/60">Carbs</p>
              <p className="text-lg font-semibold text-white">{Math.round(nutrition.carbs)}g</p>
            </div>
            <div>
              <p className="text-white/60">Fat</p>
              <p className="text-lg font-semibold text-white">{Math.round(nutrition.fat)}g</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSaveRecipe}
        disabled={loading || !recipeName.trim() || ingredients.length === 0}
        className="w-full"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
            Saving Recipe...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Recipe
          </>
        )}
      </Button>
    </Card>
  );
}
