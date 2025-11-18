/**
 * User Onboarding System
 * Multi-step onboarding flow with profile setup and goal configuration
 */

export type FitnessGoal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'maintain_weight'
  | 'improve_endurance'
  | 'general_fitness';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'gluten_free'
  | 'dairy_free';

export interface OnboardingProfile {
  // Step 1: Basic Info
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';

  // Step 2: Physical Stats
  height: number; // in inches
  current_weight: number; // in lbs
  target_weight?: number;

  // Step 3: Goals & Activity
  fitness_goal: FitnessGoal;
  activity_level: ActivityLevel;
  workout_days_per_week: number;

  // Step 4: Nutrition Preferences
  dietary_preference: DietaryPreference;
  allergies?: string[];
  daily_calorie_target?: number;
  macro_targets?: {
    protein_percentage: number;
    carbs_percentage: number;
    fat_percentage: number;
  };

  // Step 5: Preferences
  notifications_enabled: boolean;
  reminder_times?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    workout?: string;
  };
  measurement_system: 'imperial' | 'metric';

  // Step 6: Integrations
  connected_devices?: string[];
  ai_features_enabled: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export class OnboardingService {
  /**
   * Get onboarding steps
   */
  static getSteps(): OnboardingStep[] {
    return [
      {
        id: 'welcome',
        title: 'Welcome to ISTANI',
        description: 'Let\'s get you started on your fitness journey',
        completed: false,
      },
      {
        id: 'basic-info',
        title: 'Basic Information',
        description: 'Tell us about yourself',
        completed: false,
      },
      {
        id: 'physical-stats',
        title: 'Physical Stats',
        description: 'Your current measurements',
        completed: false,
      },
      {
        id: 'goals',
        title: 'Fitness Goals',
        description: 'What do you want to achieve?',
        completed: false,
      },
      {
        id: 'nutrition',
        title: 'Nutrition Preferences',
        description: 'Dietary preferences and targets',
        completed: false,
      },
      {
        id: 'preferences',
        title: 'App Preferences',
        description: 'Customize your experience',
        completed: false,
      },
      {
        id: 'integrations',
        title: 'Connect Devices',
        description: 'Sync with your favorite apps',
        completed: false,
      },
      {
        id: 'complete',
        title: 'All Set!',
        description: 'Your profile is ready',
        completed: false,
      },
    ];
  }

  /**
   * Calculate recommended daily calories based on user profile
   * Using Mifflin-St Jeor Equation
   */
  static calculateDailyCalories(profile: Partial<OnboardingProfile>): number {
    if (!profile.current_weight || !profile.height || !profile.age || !profile.gender) {
      return 2000; // Default fallback
    }

    // Convert to metric for calculation
    const weightKg = profile.current_weight * 0.453592;
    const heightCm = profile.height * 2.54;

    // Calculate BMR (Basal Metabolic Rate)
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age;
    if (profile.gender === 'male') {
      bmr += 5;
    } else if (profile.gender === 'female') {
      bmr -= 161;
    }

    // Apply activity multiplier
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[profile.activity_level || 'sedentary']);

    // Adjust based on fitness goal
    let targetCalories = tdee;
    if (profile.fitness_goal === 'lose_weight') {
      targetCalories -= 500; // 500 calorie deficit for ~1 lb/week loss
    } else if (profile.fitness_goal === 'gain_muscle') {
      targetCalories += 300; // 300 calorie surplus for muscle gain
    }

    return Math.round(targetCalories);
  }

  /**
   * Get recommended macro percentages based on fitness goal
   */
  static getRecommendedMacros(goal: FitnessGoal): {
    protein_percentage: number;
    carbs_percentage: number;
    fat_percentage: number;
  } {
    const macroPresets: Record<
      FitnessGoal,
      { protein_percentage: number; carbs_percentage: number; fat_percentage: number }
    > = {
      lose_weight: { protein_percentage: 35, carbs_percentage: 35, fat_percentage: 30 },
      gain_muscle: { protein_percentage: 30, carbs_percentage: 45, fat_percentage: 25 },
      maintain_weight: { protein_percentage: 25, carbs_percentage: 45, fat_percentage: 30 },
      improve_endurance: { protein_percentage: 20, carbs_percentage: 55, fat_percentage: 25 },
      general_fitness: { protein_percentage: 25, carbs_percentage: 45, fat_percentage: 30 },
    };

    return macroPresets[goal];
  }

  /**
   * Save onboarding profile
   */
  static async saveProfile(userId: string, profile: OnboardingProfile): Promise<void> {
    try {
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving onboarding profile:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  static async completeOnboarding(userId: string): Promise<void> {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/onboarding/status?user_id=${userId}`);
      const data = await response.json();
      return data.completed || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Get tutorial steps for app walkthrough
   */
  static getTutorialSteps(): Array<{
    id: string;
    title: string;
    description: string;
    target?: string; // CSS selector for highlight
    action?: string;
  }> {
    return [
      {
        id: 'dashboard',
        title: 'Your Dashboard',
        description: 'This is your home base. Track your daily progress and see key metrics at a glance.',
        target: '#dashboard',
      },
      {
        id: 'log-meal',
        title: 'Log Your Meals',
        description: 'Tap here to log meals. Use our AI photo recognition or search our extensive food database.',
        target: '#log-meal-button',
        action: 'Click to try it',
      },
      {
        id: 'log-workout',
        title: 'Track Workouts',
        description: 'Record your workouts and track your exercise progress over time.',
        target: '#log-workout-button',
        action: 'Click to try it',
      },
      {
        id: 'analytics',
        title: 'View Analytics',
        description: 'Dive deep into your fitness data with comprehensive charts and insights.',
        target: '#analytics-link',
      },
      {
        id: 'social',
        title: 'Connect with Friends',
        description: 'Add friends, join challenges, and stay motivated together!',
        target: '#social-link',
      },
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        description: 'Ask our AI assistant anything about nutrition, workouts, or your progress.',
        target: '#ai-assistant-button',
      },
    ];
  }

  /**
   * Generate personalized recommendations
   */
  static async generateRecommendations(
    profile: OnboardingProfile
  ): Promise<{
    workouts: string[];
    meals: string[];
    tips: string[];
  }> {
    // In production, this would call an AI service
    const recommendations = {
      workouts: [] as string[],
      meals: [] as string[],
      tips: [] as string[],
    };

    // Workout recommendations based on goal
    if (profile.fitness_goal === 'lose_weight') {
      recommendations.workouts = [
        'High-Intensity Interval Training (HIIT) - 30 minutes',
        'Brisk Walking - 45 minutes',
        'Circuit Training - 40 minutes',
        'Swimming - 30 minutes',
      ];
    } else if (profile.fitness_goal === 'gain_muscle') {
      recommendations.workouts = [
        'Upper Body Strength Training - 45 minutes',
        'Lower Body Strength Training - 45 minutes',
        'Full Body Compound Exercises - 60 minutes',
        'Progressive Overload Training - 50 minutes',
      ];
    } else if (profile.fitness_goal === 'improve_endurance') {
      recommendations.workouts = [
        'Long Distance Running - 60 minutes',
        'Cycling - 90 minutes',
        'Rowing - 45 minutes',
        'Swimming - 45 minutes',
      ];
    }

    // Meal recommendations based on dietary preference
    if (profile.dietary_preference === 'vegetarian') {
      recommendations.meals = [
        'Quinoa Buddha Bowl with Roasted Vegetables',
        'Lentil Curry with Brown Rice',
        'Greek Yogurt Parfait with Berries',
        'Veggie Stir-Fry with Tofu',
      ];
    } else if (profile.dietary_preference === 'vegan') {
      recommendations.meals = [
        'Chickpea Salad Sandwich',
        'Tofu Scramble with Avocado Toast',
        'Black Bean Burrito Bowl',
        'Smoothie Bowl with Chia Seeds',
      ];
    } else if (profile.dietary_preference === 'keto') {
      recommendations.meals = [
        'Grilled Salmon with Asparagus',
        'Egg and Avocado Bowl',
        'Cauliflower Rice Chicken Bowl',
        'Keto Cheeseburger Bowl',
      ];
    }

    // General tips
    recommendations.tips = [
      `Drink at least ${Math.round(profile.current_weight * 0.5)} oz of water daily`,
      'Get 7-9 hours of sleep each night for optimal recovery',
      'Take progress photos every 2 weeks to track visual changes',
      'Meal prep on Sundays to stay on track during the week',
      'Listen to your body and take rest days when needed',
    ];

    return recommendations;
  }
}

export default OnboardingService;
