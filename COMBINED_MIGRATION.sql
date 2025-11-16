-- =============================================================================
-- ISTANI FITNESS - COMBINED DATABASE MIGRATION
-- Generated: 2025-11-11T09:32:53.616Z
-- Execute this file in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/kxsmgrlpojdsgvjdodda/sql/new
-- =============================================================================

-- =============================================================================
-- MIGRATION 001: INITIAL SCHEMA
-- =============================================================================

-- Istani Fitness Platform - Initial Schema
-- Complete database structure for fitness tracking, e-commerce, and coaching

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  fitness_goals TEXT[] DEFAULT '{}',
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  dietary_restrictions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- E-COMMERCE TABLES
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time DECIMAL(10,2) NOT NULL CHECK (price_at_time >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FITNESS TRACKING TABLES
-- ============================================================================

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'sports', 'other')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  calories_burned INTEGER CHECK (calories_burned >= 0),
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  weight_kg DECIMAL(6,2) CHECK (weight_kg >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein_g DECIMAL(6,2) NOT NULL CHECK (protein_g >= 0),
  carbs_g DECIMAL(6,2) NOT NULL CHECK (carbs_g >= 0),
  fats_g DECIMAL(6,2) NOT NULL CHECK (fats_g >= 0),
  logged_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0),
  body_fat_percentage DECIMAL(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass_kg DECIMAL(5,2) CHECK (muscle_mass_kg >= 0),
  chest_cm DECIMAL(5,2) CHECK (chest_cm >= 0),
  waist_cm DECIMAL(5,2) CHECK (waist_cm >= 0),
  hips_cm DECIMAL(5,2) CHECK (hips_cm >= 0),
  measured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COACHING & SUPPORT TABLES
-- ============================================================================

CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('onboarding', 'weekly', 'monthly', 'elite')),
  price_paid DECIMAL(10,2) NOT NULL CHECK (price_paid >= 0),
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  coach_email TEXT DEFAULT 'istaniDOTstore@proton.me',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  buymeacoffee_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = TRUE;

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Workouts
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_completed_at ON workouts(completed_at);

-- Workout Exercises
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Meals
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_logged_at ON meals(logged_at);

-- Body Measurements
CREATE INDEX idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX idx_body_measurements_measured_at ON body_measurements(measured_at);

-- Coaching Sessions
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_coaching_sessions_scheduled_at ON coaching_sessions(scheduled_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Products: Anyone can view, only admins can modify (add admin role later)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items: Users can view items from their orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Workouts: Users can only see and manage their own workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Workout Exercises: Users can manage exercises from their workouts
CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own workout exercises"
  ON workout_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Meals: Users can only see and manage their own meals
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- Body Measurements: Users can only see and manage their own measurements
CREATE POLICY "Users can view own measurements"
  ON body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own measurements"
  ON body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Coaching Sessions: Users can view their own sessions
CREATE POLICY "Users can view own coaching sessions"
  ON coaching_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Donations: Public read, service role insert
CREATE POLICY "Anyone can view donations"
  ON donations FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Sample Products
INSERT INTO products (name, description, price, category, featured, stock_quantity) VALUES
  ('Whey Protein Isolate', 'Premium whey protein isolate with 25g protein per serving', 49.99, 'Supplements', true, 50),
  ('Pre-Workout Energy', 'Clean energy formula with beta-alanine and caffeine', 39.99, 'Supplements', false, 30),
  ('Resistance Bands Set', 'Professional 5-piece resistance band set with carrying case', 29.99, 'Equipment', true, 100),
  ('Yoga Mat Pro', 'Extra thick 6mm yoga mat with alignment markers', 34.99, 'Equipment', false, 75),
  ('Fitness Tracker Watch', 'Advanced fitness tracker with heart rate monitoring', 149.99, 'Technology', true, 25),
  ('Gym Duffel Bag', 'Spacious gym bag with shoe compartment', 44.99, 'Apparel', false, 60);

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Migration completed successfully
-- Next steps:
-- 1. Configure OAuth providers in Supabase Dashboard
-- 2. Set up Storage buckets for product images and user avatars
-- 3. Configure email templates for authentication
-- 4. Add admin role and policies for product management


-- =============================================================================
-- MIGRATION 002: AUTONOMOUS FEATURES
-- =============================================================================

-- Additional tables for autonomous fitness tracking
-- Run this after the initial migration

-- Water intake tracking
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  glasses_consumed INTEGER DEFAULT 0 CHECK (glasses_consumed >= 0),
  daily_goal INTEGER DEFAULT 8,
  logged_times TIMESTAMPTZ[] DEFAULT ARRAY[]::TIMESTAMPTZ[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Daily check-ins
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  mood TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Progress photos
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')),
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  notes TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User streaks
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('workout', 'nutrition', 'water', 'checkin')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Automated coaching messages
CREATE TABLE coaching_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('motivation', 'tip', 'reminder', 'celebration', 'adjustment')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Workout recommendations (AI-generated)
CREATE TABLE workout_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workout_type TEXT NOT NULL,
  exercises JSONB NOT NULL,
  duration_minutes INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL,
  reason TEXT,
  is_completed BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Nutrition recommendations
CREATE TABLE nutrition_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL,
  recommended_meals JSONB NOT NULL,
  calories INTEGER NOT NULL,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fats_g DECIMAL(6,2),
  reason TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- System health monitoring
CREATE TABLE system_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  auto_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_water_intake_user_date ON water_intake(user_id, date DESC);
CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, date DESC);
CREATE INDEX idx_progress_photos_user ON progress_photos(user_id, taken_at DESC);
CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_coaching_messages_user_unread ON coaching_messages(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_workout_recommendations_user ON workout_recommendations(user_id, generated_at DESC);
CREATE INDEX idx_nutrition_recommendations_user ON nutrition_recommendations(user_id, generated_at DESC);

-- RLS Policies
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_recommendations ENABLE ROW LEVEL SECURITY;

-- Water intake policies
CREATE POLICY "Users can manage own water intake"
  ON water_intake FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Daily check-in policies
CREATE POLICY "Users can manage own check-ins"
  ON daily_checkins FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Progress photos policies
CREATE POLICY "Users can manage own progress photos"
  ON progress_photos FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Streaks policies
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Achievements policies (public read for list)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can view own earned achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Coaching messages policies
CREATE POLICY "Users can view own coaching messages"
  ON coaching_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own coaching messages"
  ON coaching_messages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Workout recommendations policies
CREATE POLICY "Users can view own workout recommendations"
  ON workout_recommendations FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Nutrition recommendations policies
CREATE POLICY "Users can view own nutrition recommendations"
  ON nutrition_recommendations FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_water_intake_updated_at
  BEFORE UPDATE ON water_intake
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update streaks automatically
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type TEXT,
  p_activity_date DATE
)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF NOT FOUND THEN
    -- Create new streak
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, p_activity_date);
  ELSE
    IF v_last_date = p_activity_date THEN
      -- Same day, no change
      RETURN;
    ELSIF v_last_date = p_activity_date - INTERVAL '1 day' THEN
      -- Consecutive day
      v_current_streak := v_current_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    ELSE
      -- Streak broken
      v_current_streak := 1;
    END IF;

    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = p_activity_date
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed achievements
INSERT INTO achievements (name, description, icon, category, points, requirement_type, requirement_value) VALUES
  ('First Workout', 'Complete your first workout', 'fitness_center', 'workout', 10, 'workout_count', 1),
  ('Week Warrior', 'Complete 7 workouts', 'military_tech', 'workout', 50, 'workout_count', 7),
  ('Month Master', 'Complete 30 workouts', 'emoji_events', 'workout', 200, 'workout_count', 30),
  ('Century Club', 'Complete 100 workouts', 'workspace_premium', 'workout', 1000, 'workout_count', 100),
  ('Hydration Hero', 'Hit water goal 7 days in a row', 'water_drop', 'water', 50, 'water_streak', 7),
  ('Nutrition Ninja', 'Track meals for 30 days straight', 'restaurant', 'nutrition', 200, 'nutrition_streak', 30),
  ('Progress Tracker', 'Log 10 progress photos', 'photo_camera', 'progress', 100, 'photo_count', 10),
  ('Weight Goal', 'Reach your target weight', 'flag', 'progress', 500, 'weight_goal', 1),
  ('Consistent', 'Check in daily for 30 days', 'calendar_today', 'checkin', 200, 'checkin_streak', 30),
  ('Early Bird', 'Complete 10 morning workouts', 'wb_sunny', 'workout', 75, 'morning_workout_count', 10);


-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Count all tables
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count achievements (should be 10)
SELECT COUNT(*) as achievement_count FROM achievements;

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
