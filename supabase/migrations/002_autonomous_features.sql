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
