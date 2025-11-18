'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Recipe {
  id: string;
  name: string;
  description: string;
  meal_type: string[];
  difficulty: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  tags: string[];
  image_url: string | null;
}

interface MealPlan {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  target_calories_per_day: number;
  is_active: boolean;
}

interface PlannedMeal {
  id: string;
  meal_date: string;
  meal_type: string;
  recipe: Recipe | null;
  servings: number;
  is_completed: boolean;
}

export function MealPlanner() {
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadMealPlan();
    loadRecipes();
  }, []);

  useEffect(() => {
    if (activePlan) {
      loadPlannedMeals();
    }
  }, [activePlan, selectedDate]);

  async function loadMealPlan() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        setActivePlan(data);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  }

  async function loadRecipes() {
    try {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .order('rating_avg', { ascending: false })
        .limit(50);

      if (data) {
        setAvailableRecipes(data);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  }

  async function loadPlannedMeals() {
    if (!activePlan) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data } = await supabase
        .from('planned_meals')
        .select(
          `
          *,
          recipe:recipe_id (*)
        `
        )
        .eq('meal_plan_id', activePlan.id)
        .eq('meal_date', dateStr)
        .order('meal_type');

      if (data) {
        setPlannedMeals(
          data.map((pm: any) => ({
            ...pm,
            recipe: pm.recipe,
          }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading planned meals:', error);
      setLoading(false);
    }
  }

  async function createMealPlan() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name: 'Weekly Meal Plan',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          target_calories_per_day: 2000,
          target_protein_per_day: 150,
          target_carbs_per_day: 200,
          target_fat_per_day: 65,
          is_active: true,
        })
        .select()
        .single();

      if (data) {
        setActivePlan(data);
      }
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  }

  async function addMealToPlan(recipeId: string) {
    if (!activePlan || !selectedMealType) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const dateStr = selectedDate.toISOString().split('T')[0];

      await supabase.from('planned_meals').insert({
        meal_plan_id: activePlan.id,
        recipe_id: recipeId,
        meal_date: dateStr,
        meal_type: selectedMealType,
        servings: 1,
      });

      await loadPlannedMeals();
      setShowRecipeModal(false);
      setSelectedMealType(null);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  }

  async function generateShoppingList() {
    if (!activePlan) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Call the PostgreSQL function to generate shopping list
      const { data, error } = await supabase.rpc('generate_shopping_list', {
        p_meal_plan_id: activePlan.id,
        p_user_id: user.id,
      });

      if (data) {
        alert('Shopping list generated successfully!');
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
    }
  }

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🥗';
      case 'dinner':
        return '🍽️';
      case 'snack':
        return '🍎';
      default:
        return '🍴';
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'lunch':
        return 'bg-green-500/20 border-green-500/50';
      case 'dinner':
        return 'bg-blue-500/20 border-blue-500/50';
      case 'snack':
        return 'bg-purple-500/20 border-purple-500/50';
      default:
        return 'bg-white/10 border-white/30';
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (!activePlan) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
            restaurant_menu
          </span>
          <h3 className="text-2xl font-bold text-white mb-2">No Active Meal Plan</h3>
          <p className="text-white/60 mb-6">Create your first meal plan to start planning meals!</p>
          <Button onClick={createMealPlan}>Create Meal Plan</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{activePlan.name}</h2>
          <p className="text-white/60">
            {new Date(activePlan.start_date).toLocaleDateString()} -{' '}
            {new Date(activePlan.end_date).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={generateShoppingList}>
          <span className="material-symbols-outlined mr-2">shopping_cart</span>
          Generate Shopping List
        </Button>
      </div>

      {/* Date Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-white/60">{selectedDate.toLocaleDateString()}</p>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </Card>

      {/* Meal Slots */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-white/10 rounded w-1/3"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const plannedMeal = plannedMeals.find((pm) => pm.meal_type === mealType);

            return (
              <Card key={mealType} className={`p-6 border-2 ${getMealTypeColor(mealType)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getMealTypeIcon(mealType)}</span>
                    <h3 className="text-xl font-bold text-white capitalize">{mealType}</h3>
                  </div>
                  {!plannedMeal && (
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType);
                        setShowRecipeModal(true);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">add</span>
                    </button>
                  )}
                </div>

                {plannedMeal && plannedMeal.recipe ? (
                  <div>
                    <p className="text-white font-semibold mb-2">{plannedMeal.recipe.name}</p>
                    <p className="text-white/60 text-sm mb-3">
                      {plannedMeal.recipe.description}
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-white font-semibold">
                          {plannedMeal.recipe.calories_per_serving * plannedMeal.servings}
                        </p>
                        <p className="text-white/60 text-xs">cal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">
                          {Math.round(plannedMeal.recipe.protein_per_serving * plannedMeal.servings)}g
                        </p>
                        <p className="text-white/60 text-xs">protein</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">
                          {Math.round(plannedMeal.recipe.carbs_per_serving * plannedMeal.servings)}g
                        </p>
                        <p className="text-white/60 text-xs">carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold">
                          {Math.round(plannedMeal.recipe.fat_per_serving * plannedMeal.servings)}g
                        </p>
                        <p className="text-white/60 text-xs">fat</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/40">No meal planned</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Recipe Selection Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Choose Recipe for {selectedMealType}
              </h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRecipes
                .filter((r) => r.meal_type.includes(selectedMealType || ''))
                .map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                    onClick={() => addMealToPlan(recipe.id)}
                  >
                    {recipe.image_url && (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="text-white font-semibold mb-1">{recipe.name}</h4>
                    <p className="text-white/60 text-sm mb-2 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>{recipe.calories_per_serving} cal</span>
                      <span>{recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
                      <span className="capitalize">{recipe.difficulty}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
