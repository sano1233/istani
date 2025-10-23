import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  activity_level?: number;
  fitness_goal?: 'lose_weight' | 'maintain' | 'gain_muscle' | 'athletic_performance';
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  created_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  daily_calories: number;
  meals: Meal[];
  created_at: string;
}

export interface Meal {
  name: string;
  time: string;
  foods: Food[];
}

export interface Food {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes?: string;
  created_at: string;
}
