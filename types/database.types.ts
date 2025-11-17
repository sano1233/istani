export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          age: number | null;
          sex: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          body_fat_percentage: number | null;
          fitness_goals: string[] | null;
          primary_goal: string | null;
          target_weight_kg: number | null;
          target_date: string | null;
          member_since: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          sex?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          body_fat_percentage?: number | null;
          fitness_goals?: string[] | null;
          primary_goal?: string | null;
          target_weight_kg?: number | null;
          target_date?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          sex?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          body_fat_percentage?: number | null;
          fitness_goals?: string[] | null;
          primary_goal?: string | null;
          target_weight_kg?: number | null;
          target_date?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price: number;
          compare_at_price: number | null;
          images: string[];
          category_id: string | null;
          inventory_quantity: number;
          track_inventory: boolean;
          is_active: boolean;
          is_featured: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          subtotal: number;
          shipping_cost: number;
          tax: number;
          total: number;
          status: string;
          payment_status: string;
          stripe_payment_intent_id: string | null;
          shipping_address: Json;
          billing_address: Json;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
