/**
 * API Type Definitions
 * Centralized types for API requests and responses
 */

// =============================================================================
// Common Types
// =============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string>;
  stack?: string;
}

// =============================================================================
// Authentication
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// =============================================================================
// User Profile
// =============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
}

// =============================================================================
// Fitness
// =============================================================================

export interface WorkoutRequest {
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  timeAvailable: number;
}

export interface WorkoutResponse {
  workoutPlan: string;
  timestamp: string;
}

export interface MealRequest {
  goals: string[];
  dietaryRestrictions?: string[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface MealResponse {
  mealPlan: string;
  timestamp: string;
}

// =============================================================================
// E-Commerce
// =============================================================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  inventory_count: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CartItem[];
}

export interface CheckoutResponse {
  sessionId: string;
}

export interface Order {
  id: string;
  user_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

// =============================================================================
// Food & Nutrition
// =============================================================================

export interface FoodSearchRequest {
  query: string;
  pageSize?: number;
}

export interface FoodItem {
  fdcId: string;
  description: string;
  dataType: string;
  foodNutrients: FoodNutrient[];
}

export interface FoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

export interface BarcodeSearchRequest {
  barcode: string;
}

// =============================================================================
// Images
// =============================================================================

export interface ImageSearchRequest {
  query: string;
  perPage?: number;
}

export interface ImageResult {
  id: string;
  url: string;
  alt: string;
  photographer?: string;
  source: 'pexels' | 'unsplash';
}

// =============================================================================
// Health Check
// =============================================================================

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    supabase: string;
    stripe: string;
    github?: { status: string; message?: string };
    pexels?: { status: string; message?: string };
    unsplash?: { status: string; message?: string };
    openai?: { status: string; message?: string };
    openFoodFacts?: { status: string };
  };
  environment: {
    node: string;
    hasSupabaseUrl: boolean;
    hasStripeKey: boolean;
    hasGitHubToken: boolean;
    hasPexelsKey: boolean;
    hasUnsplashKey: boolean;
    hasOpenAIKey: boolean;
  };
}

// =============================================================================
// Webhooks
// =============================================================================

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// =============================================================================
// CRON Jobs
// =============================================================================

export interface CronJobResponse {
  success: boolean;
  message: string;
  timestamp: string;
  error?: string;
}

// =============================================================================
// Type Guards
// =============================================================================

export function isApiError(response: any): response is ApiError {
  return typeof response === 'object' && 'error' in response;
}

export function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray(response.data) &&
    'pagination' in response
  );
}
