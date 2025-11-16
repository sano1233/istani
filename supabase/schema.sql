-- Istani Fitness Database Schema
-- Comprehensive fitness platform with lead generation, coaching, and automation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free', -- free, premium, elite_coaching
  is_lead BOOLEAN DEFAULT true,
  lead_source TEXT, -- 'email_signup', 'workout_tracker', 'nutrition_plan'
  total_workouts INTEGER DEFAULT 0,
  total_meals_logged INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Generation & Email Signups
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  signup_source TEXT, -- 'homepage', 'workout', 'nutrition', 'coaching'
  interests TEXT[], -- ['weight_loss', 'muscle_gain', 'nutrition', 'coaching']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sequence_stage INTEGER DEFAULT 0, -- For automated email sequences
  is_converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Workout Programs
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  duration_weeks INTEGER,
  goals TEXT[], -- ['weight_loss', 'muscle_gain', 'strength', 'endurance']
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES workout_programs(id),
  workout_date DATE NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  exercises JSONB, -- [{name, sets, reps, weight}]
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises Database
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT, -- 'strength', 'cardio', 'flexibility', 'sports'
  muscle_groups TEXT[], -- ['chest', 'back', 'legs', 'arms', 'core']
  equipment TEXT[], -- ['barbell', 'dumbbell', 'bodyweight', 'machine']
  difficulty TEXT,
  instructions TEXT,
  video_url TEXT,
  calories_per_minute NUMERIC(5,2)
);

-- Nutrition & Meal Tracking
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
  meal_name TEXT,
  calories INTEGER,
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  fiber_g NUMERIC(6,2),
  foods JSONB, -- [{name, quantity, unit, calories, macros}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Goals
CREATE TABLE nutrition_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_calories INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  water_ml INTEGER DEFAULT 2000,
  goal_type TEXT, -- 'weight_loss', 'maintenance', 'muscle_gain'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Exclusive Coaching (Hormozi Model)
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coach_email TEXT DEFAULT 'istaniDOTstore@proton.me',
  session_date TIMESTAMP WITH TIME ZONE,
  session_type TEXT, -- 'onboarding', 'weekly', 'monthly', 'emergency'
  duration_minutes INTEGER DEFAULT 60,
  price_paid NUMERIC(10,2),
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  notes TEXT,
  recording_url TEXT,
  action_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations & Payments
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  donation_type TEXT, -- 'one_time', 'monthly', 'buymeacoffee'
  buymeacoffee_username TEXT DEFAULT 'istanifitn',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Tracking
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  body_fat_percentage NUMERIC(4,2),
  chest_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hips_cm NUMERIC(5,2),
  biceps_cm NUMERIC(5,2),
  thighs_cm NUMERIC(5,2),
  photos JSONB, -- {front, side, back}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-Powered Recommendations
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type TEXT, -- 'workout', 'nutrition', 'rest', 'motivation'
  title TEXT NOT NULL,
  description TEXT,
  ai_model TEXT, -- 'gemini', 'claude', 'openai'
  confidence_score NUMERIC(3,2),
  is_active BOOLEAN DEFAULT true,
  user_feedback TEXT, -- 'helpful', 'not_helpful', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Automation Sequences
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sequence_type TEXT, -- 'welcome', 'workout_tips', 'nutrition_guide', 'coaching_upsell'
  emails JSONB, -- [{day, subject, body_html, cta_url}]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics & Metrics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'page_view', 'signup', 'workout_complete', 'meal_logged'
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_data JSONB,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content & Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author TEXT DEFAULT 'Istani Fitness Team',
  category TEXT, -- 'workouts', 'nutrition', 'motivation', 'success_stories'
  tags TEXT[],
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id, workout_date);
CREATE INDEX idx_meals_user ON meals(user_id, meal_date);
CREATE INDEX idx_coaching_sessions_user ON coaching_sessions(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY workout_sessions_own_data ON workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY meals_own_data ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY nutrition_goals_own_data ON nutrition_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY body_measurements_own_data ON body_measurements FOR ALL USING (auth.uid() = user_id);

-- Public read access to exercises and blog posts
CREATE POLICY exercises_public_read ON exercises FOR SELECT USING (true);
CREATE POLICY blog_posts_public_read ON blog_posts FOR SELECT USING (is_published = true);

-- Functions for automated tasks
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    last_active_at = NOW(),
    total_workouts = total_workouts + 1,
    streak_days = CASE
      WHEN last_active_at::date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
      WHEN last_active_at::date < CURRENT_DATE - INTERVAL '1 day' THEN 1
      ELSE streak_days
    END
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workout_session_completed
  AFTER INSERT ON workout_sessions
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_user_streak();

-- Function to track meal logging
CREATE OR REPLACE FUNCTION update_meal_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET total_meals_logged = total_meals_logged + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_logged
  AFTER INSERT ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_count();
