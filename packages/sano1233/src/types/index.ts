export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_fitness'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Profile {
  id: string
  email: string
  full_name?: string
  age?: number
  weight?: number
  height?: number
  fitness_goal?: FitnessGoal
  fitness_level?: FitnessLevel
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  price_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
  description: string
}

export interface WorkoutDay {
  day: string
  focus: string
  exercises: Exercise[]
}

export interface WorkoutWeek {
  weekNumber: number
  days: WorkoutDay[]
}

export interface WorkoutPlan {
  id: string
  user_id: string
  title: string
  description: string
  goal: FitnessGoal
  level: FitnessLevel
  duration_weeks: number
  ai_prompt?: string
  ai_model?: string
  weeks?: WorkoutWeek[]
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_plan_id?: string
  completed: boolean
  duration_minutes?: number
  calories_burned?: number
  notes?: string
  completed_at?: string
  created_at: string
}

export interface Meal {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
}

export interface NutritionPlan {
  id: string
  user_id: string
  daily_calories: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  meals?: Meal[]
  dietary_restrictions?: string[]
  created_at: string
}

export interface WorkoutGenerationRequest {
  goal: FitnessGoal
  level: FitnessLevel
  daysPerWeek: number
  equipment?: string[]
  focusAreas?: string[]
}
