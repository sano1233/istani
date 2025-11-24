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

// API Request/Response Types
export interface CheckoutRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface AIMealRequest {
  goal: 'fat_loss' | 'muscle_gain' | 'maintenance';
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  preferences?: string[];
  restrictions?: string[];
}

export interface AIMealResponse {
  meals: Array<{
    name: string;
    ingredients: string[];
    instructions: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
}

export interface AIWorkoutRequest {
  goal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'strength';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  equipment?: string[];
}

export interface AIWorkoutResponse {
  workout: {
    name: string;
    exercises: Array<{
      name: string;
      sets?: number;
      reps?: number;
      duration?: number;
      rest?: number;
    }>;
    totalDuration: number;
    difficulty: string;
  };
}

export interface FoodSearchRequest {
  query: string;
  limit?: number;
}

export interface FoodSearchResponse {
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    serving_size?: string;
    brand?: string;
  }>;
}

export interface BarcodeSearchRequest {
  barcode: string;
}

export interface BarcodeSearchResponse {
  food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    serving_size: string;
    brand?: string;
  } | null;
}

export interface ImageSearchRequest {
  query: string;
  count?: number;
}

export interface ImageSearchResponse {
  images: Array<{
    url: string;
    thumbnail: string;
    alt: string;
    photographer?: string;
    source?: string;
  }>;
}

export interface AuthRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}
