export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category_id: string;
  inventory_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  metadata: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  age?: number;
  sex?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_percentage?: number;
  fitness_goals?: string[];
  primary_goal?: string;
  target_weight_kg?: number;
  target_date?: string;
  member_since: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_weeks: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  image_url: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  date: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  workout_completed: boolean;
  calories_consumed?: number;
  notes?: string;
}
