'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save } from 'lucide-react';

interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Recipe {
  name: string;
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  perServingNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function RecipeBuilder() {
  const [recipe, setRecipe] = useState<Recipe>({
    name: '',
    description: '',
    servings: 1,
    ingredients: [],
    instructions: [''],
    totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    perServingNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchFood = async (query: string) => {
    if (!query || query.length < 2) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/food/search?query=${encodeURIComponent(query)}&source=usda&page_size=10`);
      const data = await response.json();
      setSearchResults(data.results?.usda?.foods || []);
    } catch (error) {
      console.error('Food search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addIngredient = (food: any) => {
    const nutrientProfile = food.nutrientProfile || {};
    const newIngredient: RecipeIngredient = {
      id: Math.random().toString(36).substring(7),
      name: food.description || food.name,
      amount: 100,
      unit: 'g',
      calories: nutrientProfile.calories || 0,
      protein: nutrientProfile.protein || 0,
      carbs: nutrientProfile.carbs || 0,
      fat: nutrientProfile.fat || 0,
    };

    const updatedIngredients = [...recipe.ingredients, newIngredient];
    updateRecipeNutrition(updatedIngredients);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeIngredient = (id: string) => {
    const updatedIngredients = recipe.ingredients.filter(ing => ing.id !== id);
    updateRecipeNutrition(updatedIngredients);
  };

  const updateIngredientAmount = (id: string, amount: number) => {
    const updatedIngredients = recipe.ingredients.map(ing =>
      ing.id === id ? { ...ing, amount } : ing
    );
    updateRecipeNutrition(updatedIngredients);
  };

  const updateRecipeNutrition = (ingredients: RecipeIngredient[]) => {
    const totalNutrition = ingredients.reduce(
      (total, ing) => {
        const multiplier = ing.amount / 100; // Assuming base nutrition is per 100g
        return {
          calories: total.calories + ing.calories * multiplier,
          protein: total.protein + ing.protein * multiplier,
          carbs: total.carbs + ing.carbs * multiplier,
          fat: total.fat + ing.fat * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const perServingNutrition = {
      calories: totalNutrition.calories / recipe.servings,
      protein: totalNutrition.protein / recipe.servings,
      carbs: totalNutrition.carbs / recipe.servings,
      fat: totalNutrition.fat / recipe.servings,
    };

    setRecipe(prev => ({
      ...prev,
      ingredients,
      totalNutrition,
      perServingNutrition,
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => (i === index ? value : inst)),
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const saveRecipe = async () => {
    // TODO: Implement save to Supabase
    console.log('Saving recipe:', recipe);
    alert('Recipe saved! (Implementation pending)');
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recipe Builder</CardTitle>
          <CardDescription>Create custom recipes with automatic macro calculation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Recipe Name</label>
              <Input
                value={recipe.name}
                onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Protein Pancakes"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={recipe.description}
                onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your recipe..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Servings</label>
              <Input
                type="number"
                min="1"
                value={recipe.servings}
                onChange={(e) => {
                  const servings = parseInt(e.target.value) || 1;
                  setRecipe(prev => ({ ...prev, servings }));
                  updateRecipeNutrition(recipe.ingredients);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
          <CardDescription>Search and add ingredients to your recipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') searchFood(searchQuery);
                }}
                placeholder="Search for ingredients..."
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => addIngredient(food)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{food.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.nutrientProfile?.calories || 0} cal, {food.nutrientProfile?.protein || 0}g protein
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center gap-2 p-2 border rounded-md">
                  <div className="flex-1">
                    <div className="font-medium">{ing.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(ing.calories * ing.amount / 100).toFixed(0)} cal
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={ing.amount}
                    onChange={(e) => updateIngredientAmount(ing.id, parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">{ing.unit}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(ing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>Add step-by-step cooking instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <span className="font-medium text-muted-foreground">{index + 1}.</span>
              <Textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder="Enter cooking step..."
                rows={2}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(index)}
                disabled={recipe.instructions.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addInstruction} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between">
                  <span>Calories</span>
                  <span className="font-medium">{recipe.totalNutrition.calories.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span className="font-medium">{recipe.totalNutrition.protein.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs</span>
                  <span className="font-medium">{recipe.totalNutrition.carbs.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat</span>
                  <span className="font-medium">{recipe.totalNutrition.fat.toFixed(1)}g</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Per Serving</div>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between">
                  <span>Calories</span>
                  <span className="font-medium">{recipe.perServingNutrition.calories.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span className="font-medium">{recipe.perServingNutrition.protein.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs</span>
                  <span className="font-medium">{recipe.perServingNutrition.carbs.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat</span>
                  <span className="font-medium">{recipe.perServingNutrition.fat.toFixed(1)}g</span>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={saveRecipe} className="w-full mt-6">
            <Save className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecipeBuilder;
