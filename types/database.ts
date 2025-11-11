export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          age: number | null
          gender: string | null
          height_cm: number | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          fitness_goals: string[] | null
          activity_level: string | null
          dietary_restrictions: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          fitness_goals?: string[] | null
          activity_level?: string | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          fitness_goals?: string[] | null
          activity_level?: string | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          stock_quantity: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          stock_quantity?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          stock_quantity?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total_amount: number
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total_amount: number
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total_amount?: number
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_time?: number
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_type: string
          duration_minutes: number
          calories_burned: number | null
          notes: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_type: string
          duration_minutes: number
          calories_burned?: number | null
          notes?: string | null
          completed_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_type?: string
          duration_minutes?: number
          calories_burned?: number | null
          notes?: string | null
          completed_at?: string
          created_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_name: string
          sets: number
          reps: number
          weight_kg: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_name: string
          sets: number
          reps: number
          weight_kg?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_name?: string
          sets?: number
          reps?: number
          weight_kg?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_type: string
          meal_name: string
          calories: number
          protein_g: number
          carbs_g: number
          fats_g: number
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type: string
          meal_name: string
          calories: number
          protein_g: number
          carbs_g: number
          fats_g: number
          logged_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: string
          meal_name?: string
          calories?: number
          protein_g?: number
          carbs_g?: number
          fats_g?: number
          logged_at?: string
          created_at?: string
        }
      }
      body_measurements: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          chest_cm: number | null
          waist_cm: number | null
          hips_cm: number | null
          measured_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight_kg: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          measured_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight_kg?: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          measured_at?: string
          created_at?: string
        }
      }
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          price_paid: number
          scheduled_at: string
          completed_at: string | null
          notes: string | null
          coach_email: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: string
          price_paid: number
          scheduled_at: string
          completed_at?: string | null
          notes?: string | null
          coach_email?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          price_paid?: number
          scheduled_at?: string
          completed_at?: string | null
          notes?: string | null
          coach_email?: string
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_email: string
          amount: number
          message: string | null
          buymeacoffee_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_email: string
          amount: number
          message?: string | null
          buymeacoffee_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          amount?: number
          message?: string | null
          buymeacoffee_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
