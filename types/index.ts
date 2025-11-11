import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row']
export type Meal = Database['public']['Tables']['meals']['Row']
export type BodyMeasurement = Database['public']['Tables']['body_measurements']['Row']
export type CoachingSession = Database['public']['Tables']['coaching_sessions']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']

export interface CartItem {
  product: Product
  quantity: number
}

export interface FitnessMetrics {
  bmr: number
  tdee: number
  proteinTarget: number
  carbsTarget: number
  fatsTarget: number
}

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExercise[]
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[]
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other'
export type CoachingPlan = 'onboarding' | 'weekly' | 'monthly' | 'elite'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
