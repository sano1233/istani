'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
  frequency?: number; // How often user eats this
  lastEaten?: string;
  imageUrl?: string;
}

interface MealEntry {
  id: string;
  foodItem: FoodItem;
  servings: number;
  timestamp: Date;
}

interface SmartSuggestion {
  reason: string;
  foods: FoodItem[];
}

export function IntelligentMealTracker() {
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [selectedMealTime, setSelectedMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate today's totals
  const todaysTotals = todaysMeals.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.foodItem.calories * entry.servings,
      protein: acc.protein + entry.foodItem.protein * entry.servings,
      carbs: acc.carbs + entry.foodItem.carbs * entry.servings,
      fats: acc.fats + entry.foodItem.fats * entry.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Get current time-based suggestion
  const getTimeBasedMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  // Load smart suggestions based on time, history, and goals
  useEffect(() => {
    loadSmartSuggestions();
  }, [selectedMealTime, todaysMeals]);

  const loadSmartSuggestions = async () => {
    // Simulate AI-powered suggestions
    const currentMealTime = getTimeBasedMealType();
    const suggestions: SmartSuggestion[] = [];

    // Time-based suggestions
    if (currentMealTime === 'breakfast') {
      suggestions.push({
        reason: `Good morning! Here's what you usually eat for breakfast`,
        foods: [
          {
            id: '1',
            name: 'Oatmeal with Berries',
            calories: 320,
            protein: 12,
            carbs: 58,
            fats: 6,
            serving_size: '1 bowl',
            frequency: 15,
            imageUrl: '/foods/oatmeal.jpg',
          },
          {
            id: '2',
            name: 'Greek Yogurt Parfait',
            calories: 280,
            protein: 20,
            carbs: 35,
            fats: 8,
            serving_size: '1 cup',
            frequency: 12,
          },
        ],
      });
    }

    // Macro-based suggestions (need more protein)
    const proteinTarget = 150; // Should come from user goals
    const currentProtein = todaysTotals.protein;
    if (currentProtein < proteinTarget * 0.3) {
      suggestions.push({
        reason: `You need ${Math.round(proteinTarget - currentProtein)}g more protein today`,
        foods: [
          {
            id: '3',
            name: 'Grilled Chicken Breast',
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
            serving_size: '100g',
          },
          {
            id: '4',
            name: 'Protein Shake',
            calories: 120,
            protein: 24,
            carbs: 3,
            fats: 1.5,
            serving_size: '1 scoop',
          },
        ],
      });
    }

    // Pattern-based suggestions (similar day last week)
    suggestions.push({
      reason: 'Based on what you ate last Tuesday',
      foods: [
        {
          id: '5',
          name: 'Quinoa Bowl',
          calories: 420,
          protein: 18,
          carbs: 65,
          fats: 12,
          serving_size: '1 bowl',
          frequency: 8,
        },
      ],
    });

    setSmartSuggestions(suggestions);
  };

  const searchFood = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Call USDA + OpenFoodFacts API
      const response = await fetch(`/api/food/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.foods || []);
    } catch (error) {
      console.error('Food search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        // Use Gemini Vision to analyze food
        const response = await fetch('/api/ai/analyze-food-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await response.json();

        if (data.detectedFoods) {
          // Show detected foods for user confirmation
          setSearchResults(data.detectedFoods);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo analysis error:', error);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const addMeal = async (food: FoodItem, servings: number = 1) => {
    const newMeal: MealEntry = {
      id: Math.random().toString(36).substr(2, 9),
      foodItem: food,
      servings,
      timestamp: new Date(),
    };

    setTodaysMeals((prev) => [...prev, newMeal]);

    // Save to database
    try {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: food.name,
          calories: food.calories * servings,
          protein: food.protein * servings,
          carbs: food.carbs * servings,
          fats: food.fats * servings,
          servings,
          meal_type: selectedMealTime,
        }),
      });

      // Update food frequency (for smarter suggestions)
      await fetch('/api/food/update-frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: food.id }),
      });
    } catch (error) {
      console.error('Failed to save meal:', error);
    }

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMeal = async (mealId: string) => {
    setTodaysMeals((prev) => prev.filter((m) => m.id !== mealId));
    // Also remove from database
  };

  const MacroProgress = ({ label, current, target, unit = 'g', color }: any) => {
    const percentage = Math.min((current / target) * 100, 100);

    return (
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/60">{label}</span>
          <span className="font-semibold">
            {Math.round(current)}/{target}
            {unit}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${color}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Today's Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <h3 className="text-2xl font-bold mb-4">Today's Nutrition</h3>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-black text-gradient-success">
              {Math.round(todaysTotals.calories)}
            </div>
            <div className="text-sm text-white/60">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(todaysTotals.protein)}g</div>
            <div className="text-sm text-white/60">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(todaysTotals.carbs)}g</div>
            <div className="text-sm text-white/60">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(todaysTotals.fats)}g</div>
            <div className="text-sm text-white/60">Fats</div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="space-y-3">
          <MacroProgress label="Protein" current={todaysTotals.protein} target={150} color="bg-green-500" />
          <MacroProgress label="Carbs" current={todaysTotals.carbs} target={200} color="bg-blue-500" />
          <MacroProgress label="Fats" current={todaysTotals.fats} target={65} color="bg-yellow-500" />
        </div>
      </Card>

      {/* Meal Time Selector */}
      <div className="flex gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealTime) => (
          <button
            key={mealTime}
            onClick={() => setSelectedMealTime(mealTime)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold capitalize transition-all ${
              selectedMealTime === mealTime
                ? 'bg-primary text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {mealTime}
          </button>
        ))}
      </div>

      {/* Smart Suggestions */}
      <AnimatePresence>
        {smartSuggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-4 bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <h4 className="font-semibold text-sm">{suggestion.reason}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestion.foods.map((food) => (
                  <motion.div
                    key={food.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => addMeal(food)}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{food.name}</div>
                      <div className="text-xs text-white/60">
                        {food.calories} cal • {food.protein}g protein
                      </div>
                      {food.frequency && (
                        <div className="text-xs text-primary mt-1">
                          Eaten {food.frequency} times this month
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="ml-3">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Search & Photo Upload */}
      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchFood(e.target.value);
              }}
              placeholder="Search for food (e.g., chicken breast, banana)..."
              className="pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzingPhoto}
            variant="outline"
            className="shrink-0"
          >
            {isAnalyzingPhoto ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">photo_camera</span>
            )}
          </Button>
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {searchResults.map((food) => (
                <motion.div
                  key={food.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{food.name}</div>
                    <div className="text-sm text-white/60">
                      {food.calories} cal • P:{food.protein}g C:{food.carbs}g F:{food.fats}g • {food.serving_size}
                    </div>
                  </div>
                  <Button onClick={() => addMeal(food)} size="sm">
                    Add
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Today's Meals */}
      <Card className="p-4">
        <h3 className="text-xl font-bold mb-4">Today's Meals</h3>

        {todaysMeals.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <span className="material-symbols-outlined text-5xl mb-2">restaurant</span>
            <p>No meals logged yet. Start tracking to reach your goals!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysMeals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold">{meal.foodItem.name}</div>
                  <div className="text-sm text-white/60">
                    {meal.servings} × {meal.foodItem.serving_size} •{' '}
                    {Math.round(meal.foodItem.calories * meal.servings)} cal
                  </div>
                </div>
                <Button
                  onClick={() => removeMeal(meal.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:bg-red-500/10"
                >
                  <span className="material-symbols-outlined">delete</span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
