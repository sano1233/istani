'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Trash2, ShoppingCart, Download } from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: string[];
}

interface DayPlan {
  date: string;
  meals: Meal[];
}

export function MealPlanner() {
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const generateWeekPlan = () => {
    const today = new Date();
    const week: DayPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      week.push({
        date: date.toISOString().split('T')[0],
        meals: [],
      });
    }

    setWeekPlan(week);
  };

  const addMealToDay = (date: string, meal: Meal) => {
    setWeekPlan(prev =>
      prev.map(day =>
        day.date === date ? { ...day, meals: [...day.meals, meal] } : day
      )
    );
  };

  const removeMealFromDay = (date: string, mealId: string) => {
    setWeekPlan(prev =>
      prev.map(day =>
        day.date === date
          ? { ...day, meals: day.meals.filter(m => m.id !== mealId) }
          : day
      )
    );
  };

  const generateGroceryList = () => {
    const allIngredients: Record<string, number> = {};

    weekPlan.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients?.forEach(ingredient => {
          allIngredients[ingredient] = (allIngredients[ingredient] || 0) + 1;
        });
      });
    });

    const groceryList = Object.entries(allIngredients)
      .map(([item, count]) => `${item} (x${count})`)
      .join('\n');

    // Create downloadable text file
    const blob = new Blob([groceryList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMealPlan = () => {
    const planText = weekPlan
      .map(day => {
        const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const meals = day.meals
          .map(m => `  - ${m.type}: ${m.name} (${m.calories} cal)`)
          .join('\n');
        return `${dayName}\n${meals || '  No meals planned'}`;
      })
      .join('\n\n');

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDayTotals = (day: DayPlan) => {
    return day.meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meal Planner
              </CardTitle>
              <CardDescription>Plan your meals for the week and generate grocery lists</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateWeekPlan} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Week Plan
              </Button>
              <Button onClick={generateGroceryList} variant="outline" disabled={weekPlan.length === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Grocery List
              </Button>
              <Button onClick={exportMealPlan} variant="outline" disabled={weekPlan.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {weekPlan.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No meal plan yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a new week plan to start organizing your meals
            </p>
            <Button onClick={generateWeekPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Week Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {weekPlan.map(day => {
            const totals = getDayTotals(day);
            const dayName = new Date(day.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card key={day.date}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{dayName}</CardTitle>
                      <CardDescription>
                        {totals.calories} cal • {totals.protein.toFixed(0)}g protein •{' '}
                        {totals.carbs.toFixed(0)}g carbs • {totals.fat.toFixed(0)}g fat
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {day.meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No meals planned for this day
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {day.meals.map(meal => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div>
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} •{' '}
                              {meal.calories} cal • {meal.protein}g protein
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMealFromDay(day.date, meal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MealPlanner;
