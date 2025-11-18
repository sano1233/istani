-- Habit Tracker System
-- Track daily habits with streaks, reminders, and analytics

-- Habit Categories
CREATE TABLE habit_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO habit_categories (name, icon, color) VALUES
('fitness', 'fitness_center', '#10b981'),
('nutrition', 'restaurant', '#f59e0b'),
('mindfulness', 'self_improvement', '#a855f7'),
('sleep', 'bedtime', '#3b82f6'),
('hydration', 'water_drop', '#06b6d4'),
('productivity', 'workspace_premium', '#eab308'),
('learning', 'school', '#ec4899');

-- User Habits
CREATE TABLE user_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES habit_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'check_circle',
  color TEXT DEFAULT '#00ffff',

  -- Frequency and Target
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'custom'
  target_days_per_week INTEGER, -- For weekly habits
  custom_schedule JSONB, -- {monday: true, tuesday: false, ...}
  target_count_per_day INTEGER DEFAULT 1,
  tracking_type TEXT DEFAULT 'boolean', -- 'boolean', 'count', 'duration', 'value'
  unit TEXT, -- 'times', 'minutes', 'liters', 'pages', etc.

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  last_completed_date DATE,

  -- Reminder settings
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TIME,
  reminder_message TEXT,

  -- Motivation
  why TEXT, -- Why this habit matters
  reward TEXT, -- Reward for maintaining streak

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'

  -- Metadata
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_habits_user ON user_habits(user_id);
CREATE INDEX idx_user_habits_category ON user_habits(category_id);
CREATE INDEX idx_user_habits_active ON user_habits(is_active) WHERE is_active = true;

-- Habit Completions (daily log)
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES user_habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  completion_time TIME DEFAULT NOW()::TIME,

  -- Tracking data
  completed BOOLEAN DEFAULT true,
  count_value INTEGER, -- For count-based habits
  duration_minutes INTEGER, -- For duration-based habits
  numeric_value NUMERIC(10,2), -- For value-based habits

  -- Context
  notes TEXT,
  mood TEXT, -- 'terrible', 'bad', 'okay', 'good', 'great'
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),

  -- Location tracking (optional)
  location TEXT,
  weather TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);

CREATE INDEX idx_habit_completions_habit ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_user ON habit_completions(user_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date DESC);

-- Habit Streaks History (track milestone streaks)
CREATE TABLE habit_streak_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES user_habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL, -- 7, 30, 60, 100, 365, etc.
  achieved_date DATE NOT NULL,
  streak_start_date DATE,
  streak_end_date DATE,
  celebration_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_streak_milestones_habit ON habit_streak_milestones(habit_id);
CREATE INDEX idx_streak_milestones_user ON habit_streak_milestones(user_id);

-- Habit Statistics (weekly/monthly aggregations)
CREATE MATERIALIZED VIEW habit_statistics AS
SELECT
  h.id AS habit_id,
  h.user_id,
  h.name AS habit_name,
  h.current_streak,
  h.longest_streak,
  h.total_completions,
  COUNT(DISTINCT hc.completion_date) AS total_days_completed,
  COUNT(DISTINCT hc.completion_date) FILTER (
    WHERE hc.completion_date >= CURRENT_DATE - INTERVAL '7 days'
  ) AS completions_last_7_days,
  COUNT(DISTINCT hc.completion_date) FILTER (
    WHERE hc.completion_date >= CURRENT_DATE - INTERVAL '30 days'
  ) AS completions_last_30_days,
  ROUND(
    COUNT(DISTINCT hc.completion_date)::NUMERIC * 100.0 /
    GREATEST(CURRENT_DATE - h.start_date + 1, 1),
    2
  ) AS overall_completion_rate,
  ROUND(
    COUNT(DISTINCT hc.completion_date) FILTER (
      WHERE hc.completion_date >= CURRENT_DATE - INTERVAL '30 days'
    )::NUMERIC * 100.0 /
    LEAST(30, CURRENT_DATE - h.start_date + 1),
    2
  ) AS completion_rate_30_days,
  AVG(hc.difficulty_rating) AS avg_difficulty,
  AVG(hc.energy_level) AS avg_energy_level,
  h.start_date,
  MAX(hc.completion_date) AS last_completion_date
FROM user_habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id
WHERE h.is_active = true AND h.is_archived = false
GROUP BY h.id, h.user_id, h.name, h.current_streak, h.longest_streak, h.total_completions, h.start_date;

CREATE UNIQUE INDEX idx_habit_statistics_habit ON habit_statistics(habit_id);
CREATE INDEX idx_habit_statistics_user ON habit_statistics(user_id);

-- Function to calculate habit streak
CREATE OR REPLACE FUNCTION calculate_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  completion_exists BOOLEAN;
  habit_frequency TEXT;
  custom_schedule JSONB;
  day_of_week INTEGER;
  should_check BOOLEAN;
BEGIN
  -- Get habit frequency
  SELECT frequency, custom_schedule
  INTO habit_frequency, custom_schedule
  FROM user_habits
  WHERE id = p_habit_id;

  LOOP
    -- Determine if we should check this day based on frequency
    should_check := true;

    IF habit_frequency = 'custom' THEN
      -- Get day of week (0 = Sunday, 6 = Saturday)
      day_of_week := EXTRACT(DOW FROM check_date);

      -- Check if this day is in the schedule
      CASE day_of_week
        WHEN 0 THEN should_check := (custom_schedule->>'sunday')::BOOLEAN;
        WHEN 1 THEN should_check := (custom_schedule->>'monday')::BOOLEAN;
        WHEN 2 THEN should_check := (custom_schedule->>'tuesday')::BOOLEAN;
        WHEN 3 THEN should_check := (custom_schedule->>'wednesday')::BOOLEAN;
        WHEN 4 THEN should_check := (custom_schedule->>'thursday')::BOOLEAN;
        WHEN 5 THEN should_check := (custom_schedule->>'friday')::BOOLEAN;
        WHEN 6 THEN should_check := (custom_schedule->>'saturday')::BOOLEAN;
      END CASE;
    END IF;

    -- If we should check this day
    IF should_check THEN
      -- Check if habit was completed on this date
      SELECT EXISTS(
        SELECT 1 FROM habit_completions
        WHERE habit_id = p_habit_id
          AND completion_date = check_date
          AND completed = true
      ) INTO completion_exists;

      IF completion_exists THEN
        current_streak := current_streak + 1;
      ELSE
        -- Allow one grace day for "today" if not yet completed
        IF check_date = CURRENT_DATE THEN
          check_date := check_date - INTERVAL '1 day';
          CONTINUE;
        ELSE
          EXIT;
        END IF;
      END IF;
    END IF;

    check_date := check_date - INTERVAL '1 day';

    -- Safety limit
    IF current_streak > 1000 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to update habit statistics after completion
CREATE OR REPLACE FUNCTION update_habit_stats_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  new_streak INTEGER;
  milestone_days INTEGER[] := ARRAY[3, 7, 14, 21, 30, 60, 90, 100, 180, 365];
  milestone INTEGER;
BEGIN
  -- Calculate new streak
  new_streak := calculate_habit_streak(NEW.habit_id);

  -- Update habit statistics
  UPDATE user_habits
  SET
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak),
    total_completions = total_completions + 1,
    last_completed_date = NEW.completion_date,
    updated_at = NOW()
  WHERE id = NEW.habit_id;

  -- Check for milestone achievements
  FOREACH milestone IN ARRAY milestone_days
  LOOP
    IF new_streak = milestone THEN
      -- Record milestone (if not already recorded)
      INSERT INTO habit_streak_milestones (habit_id, user_id, milestone_days, achieved_date, celebration_message)
      SELECT
        NEW.habit_id,
        NEW.user_id,
        milestone,
        NEW.completion_date,
        CASE milestone
          WHEN 3 THEN '🎉 Amazing start! 3 days strong!'
          WHEN 7 THEN '🔥 One week streak! You''re building momentum!'
          WHEN 14 THEN '💪 Two weeks! This is becoming a habit!'
          WHEN 21 THEN '✨ 21 days! You''re forming a lasting habit!'
          WHEN 30 THEN '🌟 One month streak! Incredible dedication!'
          WHEN 60 THEN '🚀 60 days! You''re unstoppable!'
          WHEN 90 THEN '👑 90 days! This habit is part of who you are!'
          WHEN 100 THEN '💎 100 DAYS! You''re a legend!'
          WHEN 180 THEN '🏆 6 months! Absolutely phenomenal!'
          WHEN 365 THEN '🎊 ONE YEAR STREAK! You''re a CHAMPION!'
          ELSE format('🎯 %s day milestone!', milestone)
        END
      WHERE NOT EXISTS (
        SELECT 1 FROM habit_streak_milestones
        WHERE habit_id = NEW.habit_id
          AND milestone_days = milestone
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_habit_stats
AFTER INSERT OR UPDATE ON habit_completions
FOR EACH ROW
WHEN (NEW.completed = true)
EXECUTE FUNCTION update_habit_stats_on_completion();

-- Insert sample habits for new users
CREATE OR REPLACE FUNCTION create_sample_habits(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_habits (user_id, category_id, name, description, frequency, icon, color)
  SELECT
    p_user_id,
    id,
    CASE name
      WHEN 'fitness' THEN 'Daily Workout'
      WHEN 'nutrition' THEN 'Track Meals'
      WHEN 'hydration' THEN 'Drink 2L Water'
      WHEN 'sleep' THEN '8 Hours Sleep'
      ELSE 'Daily Practice'
    END,
    CASE name
      WHEN 'fitness' THEN 'Complete at least 30 minutes of exercise'
      WHEN 'nutrition' THEN 'Log all meals in the app'
      WHEN 'hydration' THEN 'Drink 2 liters of water throughout the day'
      WHEN 'sleep' THEN 'Get 8 hours of quality sleep'
      ELSE 'Practice this habit daily'
    END,
    'daily',
    icon,
    color
  FROM habit_categories
  WHERE name IN ('fitness', 'nutrition', 'hydration', 'sleep')
  LIMIT 4;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streak_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own habits" ON user_habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits" ON user_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON user_habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON user_habits
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own completions" ON habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own completions" ON habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON habit_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON habit_completions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own milestones" ON habit_streak_milestones
  FOR SELECT USING (auth.uid() = user_id);
