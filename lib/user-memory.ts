/**
 * User Memory System
 *
 * Intelligently learns and remembers user preferences, habits, and patterns
 * to create a personalized fitness experience better than MyFitnessPal
 */

import { createClient } from '@/lib/supabase/client';

export interface UserPreferences {
  // Meal Preferences
  favoriteFoods: string[];
  mealTimings: {
    breakfast: string; // "08:00"
    lunch: string;
    dinner: string;
    snacks: string[];
  };
  dietaryRestrictions: string[];

  // Workout Preferences
  preferredWorkoutTimes: string[];
  favoriteExercises: string[];
  workoutDuration: number; // minutes

  // UI Preferences
  defaultView: 'dashboard' | 'nutrition' | 'workouts' | 'progress';
  measurementUnit: 'metric' | 'imperial';

  // Notification Preferences
  mealReminders: boolean;
  workoutReminders: boolean;
  progressUpdates: boolean;
}

export interface UserPattern {
  type: 'meal' | 'workout' | 'measurement';
  pattern: string;
  frequency: number;
  lastOccurrence: string;
  confidence: number; // 0-100
}

export class UserMemorySystem {
  private supabase = createClient();

  /**
   * Track a user action to learn patterns
   */
  async trackAction(userId: string, action: {
    type: 'meal' | 'workout' | 'measurement' | 'search';
    data: any;
    timestamp?: Date;
  }) {
    const timestamp = action.timestamp || new Date();

    // Store in memory table
    const { error } = await this.supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: action.type,
        action_data: action.data,
        created_at: timestamp.toISOString(),
      });

    if (error) {
      console.error('Failed to track action:', error);
    }

    // Update patterns in real-time
    await this.updatePatterns(userId, action.type);
  }

  /**
   * Get personalized suggestions based on learned patterns
   */
  async getSuggestions(userId: string, context: {
    timeOfDay?: number; // 0-23
    dayOfWeek?: number; // 0-6
    type: 'meal' | 'workout';
  }): Promise<any[]> {
    const timeOfDay = context.timeOfDay || new Date().getHours();
    const dayOfWeek = context.dayOfWeek || new Date().getDay();

    if (context.type === 'meal') {
      // Get frequently eaten foods at this time
      const { data: mealHistory } = await this.supabase
        .from('meals')
        .select('food_name, calories, protein, carbs, fats')
        .eq('user_id', userId)
        .gte('logged_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('logged_at', { ascending: false })
        .limit(100);

      // Count frequency manually
      const foodFrequency = (mealHistory || []).reduce((acc: any, meal) => {
        const key = meal.food_name;
        if (!acc[key]) {
          acc[key] = { ...meal, frequency: 0 };
        }
        acc[key].frequency += 1;
        return acc;
      }, {});

      // Sort by frequency
      const sortedFoods = Object.values(foodFrequency)
        .sort((a: any, b: any) => b.frequency - a.frequency)
        .slice(0, 10);

      // Filter by time of day
      const mealType = timeOfDay < 11 ? 'breakfast' : timeOfDay < 15 ? 'lunch' : timeOfDay < 20 ? 'dinner' : 'snack';

      return sortedFoods.map((meal: any) => ({
        ...meal,
        reason: `You've eaten this ${meal.frequency} times`,
        mealType,
      }));
    }

    if (context.type === 'workout') {
      // Get workouts typically done on this day/time
      const { data: workoutHistory } = await this.supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Analyze patterns
      const patterns = this.analyzeWorkoutPatterns(workoutHistory || [], dayOfWeek, timeOfDay);

      return patterns.slice(0, 5);
    }

    return [];
  }

  /**
   * Get user preferences with smart defaults
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data: stored } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stored) {
      return stored.preferences as UserPreferences;
    }

    // Generate smart defaults based on user history
    const defaults = await this.generateSmartDefaults(userId);
    return defaults;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>) {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences };

    await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences: updated,
        updated_at: new Date().toISOString(),
      });
  }

  /**
   * Predict next action
   */
  async predictNextAction(userId: string): Promise<{
    type: 'meal' | 'workout' | 'measurement';
    confidence: number;
    suggestion: string;
    time: string;
  } | null> {
    // Get recent patterns
    const { data: actions } = await this.supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (!actions || actions.length < 10) {
      return null;
    }

    // Analyze time patterns
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Find similar time/day patterns
    const similarActions = actions.filter((a) => {
      const actionDate = new Date(a.created_at);
      const hourDiff = Math.abs(actionDate.getHours() - currentHour);
      const dayMatch = actionDate.getDay() === currentDay;
      return hourDiff <= 1 && dayMatch;
    });

    if (similarActions.length === 0) {
      return null;
    }

    // Most common action at this time
    const actionCounts = similarActions.reduce((acc: any, action) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {});

    const predictedType = Object.keys(actionCounts).sort(
      (a, b) => actionCounts[b] - actionCounts[a]
    )[0] as 'meal' | 'workout' | 'measurement';

    const confidence = (actionCounts[predictedType] / similarActions.length) * 100;

    const suggestions = {
      meal: 'Time for a meal? Log what you\'re eating.',
      workout: 'You usually work out now. Ready to train?',
      measurement: 'Take your daily measurements for tracking.',
    };

    return {
      type: predictedType,
      confidence,
      suggestion: suggestions[predictedType],
      time: now.toTimeString().slice(0, 5),
    };
  }

  /**
   * Get streak information
   */
  async getStreaks(userId: string): Promise<{
    workout: number;
    nutrition: number;
    measurement: number;
    water: number;
  }> {
    const { data: streaks } = await this.supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      workout: streaks?.workout_streak || 0,
      nutrition: streaks?.nutrition_streak || 0,
      measurement: streaks?.measurement_streak || 0,
      water: streaks?.water_streak || 0,
    };
  }

  /**
   * Check and update streaks
   */
  async updateStreaks(userId: string, type: 'workout' | 'nutrition' | 'measurement' | 'water') {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get current streak
    const { data: streak } = await this.supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streak) {
      // Create new streak
      await this.supabase.from('user_streaks').insert({
        user_id: userId,
        [`${type}_streak`]: 1,
        [`${type}_last_date`]: today,
      });
      return 1;
    }

    const lastDate = streak[`${type}_last_date`];
    const currentStreak = streak[`${type}_streak`] || 0;

    if (lastDate === today) {
      // Already logged today
      return currentStreak;
    }

    if (lastDate === yesterday) {
      // Continue streak
      const newStreak = currentStreak + 1;
      await this.supabase
        .from('user_streaks')
        .update({
          [`${type}_streak`]: newStreak,
          [`${type}_last_date`]: today,
        })
        .eq('user_id', userId);
      return newStreak;
    }

    // Streak broken, reset to 1
    await this.supabase
      .from('user_streaks')
      .update({
        [`${type}_streak`]: 1,
        [`${type}_last_date`]: today,
      })
      .eq('user_id', userId);

    return 1;
  }

  // Private helper methods

  private async updatePatterns(userId: string, actionType: string) {
    // Analyze recent actions to identify patterns
    // This would run periodically or on significant events
    // For now, it's a placeholder for pattern detection logic
  }

  private analyzeWorkoutPatterns(workouts: any[], dayOfWeek: number, timeOfDay: number) {
    // Group by workout type and find patterns
    const patterns: any[] = [];

    // Find workouts on same day of week
    const sameDayWorkouts = workouts.filter((w) => {
      const workoutDay = new Date(w.date).getDay();
      return workoutDay === dayOfWeek;
    });

    if (sameDayWorkouts.length > 0) {
      const mostCommon = this.findMostCommonWorkoutType(sameDayWorkouts);
      patterns.push({
        type: mostCommon.type,
        reason: `You usually do ${mostCommon.type} on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`,
        frequency: mostCommon.count,
      });
    }

    return patterns;
  }

  private findMostCommonWorkoutType(workouts: any[]) {
    const counts: Record<string, number> = {};

    workouts.forEach((w) => {
      const type = w.workout_type || 'General';
      counts[type] = (counts[type] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      type: sorted[0]?.[0] || 'General',
      count: sorted[0]?.[1] || 0,
    };
  }

  private async generateSmartDefaults(userId: string): Promise<UserPreferences> {
    // Analyze user history to generate intelligent defaults
    return {
      favoriteFoods: [],
      mealTimings: {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '18:30',
        snacks: ['10:30', '15:30'],
      },
      dietaryRestrictions: [],
      preferredWorkoutTimes: ['07:00', '18:00'],
      favoriteExercises: [],
      workoutDuration: 45,
      defaultView: 'dashboard',
      measurementUnit: 'metric',
      mealReminders: true,
      workoutReminders: true,
      progressUpdates: true,
    };
  }
}

// Export singleton instance
export const userMemory = new UserMemorySystem();
