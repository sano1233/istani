-- Advanced Goal Setting System
-- SMART goals with milestones, progress tracking, and AI recommendations

-- Goal Categories
CREATE TABLE goal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO goal_categories (name, description, icon, color) VALUES
('weight_loss', 'Lose body weight and fat', 'trending_down', '#ef4444'),
('muscle_gain', 'Build muscle mass and strength', 'fitness_center', '#10b981'),
('strength', 'Increase overall strength', 'bolt', '#f59e0b'),
('endurance', 'Improve cardiovascular fitness', 'directions_run', '#3b82f6'),
('flexibility', 'Enhance range of motion', 'self_improvement', '#a855f7'),
('nutrition', 'Improve eating habits', 'restaurant', '#ec4899'),
('habits', 'Build healthy lifestyle habits', 'check_circle', '#06b6d4'),
('performance', 'Enhance athletic performance', 'emoji_events', '#eab308');

-- User Goals
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES goal_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL, -- 'specific', 'measurable', 'achievable', 'relevant', 'time_bound' (SMART)

  -- Measurable aspects
  metric_type TEXT, -- 'weight', 'body_fat', 'workout_count', 'calories', 'distance', 'time', 'reps', 'weight_lifted'
  starting_value NUMERIC(10,2),
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2),
  unit TEXT, -- 'kg', 'lbs', '%', 'minutes', 'km', 'reps', etc.

  -- Timeline
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  completed_date DATE,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'abandoned'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'

  -- Progress tracking
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,

  -- Motivation
  why_important TEXT, -- User's personal reason
  reward TEXT, -- What they'll get when completed
  accountability_partner_id UUID REFERENCES users(id),

  -- AI insights
  ai_recommended BOOLEAN DEFAULT false,
  ai_confidence_score NUMERIC(3,2),
  ai_recommendations TEXT[],

  -- Metadata
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_goals_category ON user_goals(category_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_user_goals_target_date ON user_goals(target_date);

-- Goal Milestones (break down goals into smaller steps)
CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES user_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(10,2),
  target_date DATE,
  completed_date DATE,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  reward TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goal_milestones_goal ON goal_milestones(goal_id);
CREATE INDEX idx_goal_milestones_completed ON goal_milestones(is_completed);

-- Goal Progress Logs (daily/weekly updates)
CREATE TABLE goal_progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES user_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  notes TEXT,
  mood TEXT, -- 'terrible', 'bad', 'okay', 'good', 'great'
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  challenges_faced TEXT[],
  wins TEXT[],
  photos JSONB, -- [{url, caption}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goal_progress_goal ON goal_progress_logs(goal_id);
CREATE INDEX idx_goal_progress_date ON goal_progress_logs(log_date DESC);

-- Goal Templates (pre-made goals users can adopt)
CREATE TABLE goal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES goal_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  metric_type TEXT,
  typical_duration_weeks INTEGER,
  difficulty TEXT,
  target_value_range JSONB, -- {min: 5, max: 10, recommended: 7.5}
  milestones_template JSONB, -- [{title, percentage, description}]
  success_tips TEXT[],
  common_obstacles TEXT[],
  recommended_actions TEXT[],
  popularity_score INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goal_templates_category ON goal_templates(category_id);
CREATE INDEX idx_goal_templates_popularity ON goal_templates(popularity_score DESC);

-- Goal Reminders
CREATE TABLE goal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES user_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reminder_type TEXT, -- 'progress_update', 'milestone_check', 'motivation', 'deadline_approaching'
  frequency TEXT, -- 'daily', 'weekly', 'bi-weekly', 'monthly'
  time_of_day TIME,
  days_of_week INTEGER[], -- [1,2,3,4,5] for Mon-Fri
  message_template TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goal_reminders_goal ON goal_reminders(goal_id);
CREATE INDEX idx_goal_reminders_user ON goal_reminders(user_id);
CREATE INDEX idx_goal_reminders_active ON goal_reminders(is_active) WHERE is_active = true;

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  goal RECORD;
  progress_pct NUMERIC(5,2);
BEGIN
  -- Get goal details
  SELECT * INTO goal FROM user_goals WHERE id = NEW.goal_id;

  -- Calculate progress percentage
  IF goal.starting_value IS NOT NULL AND goal.target_value IS NOT NULL THEN
    IF goal.target_value > goal.starting_value THEN
      -- Goal is to increase (e.g., weight gain, strength)
      progress_pct := ((NEW.value - goal.starting_value) / (goal.target_value - goal.starting_value)) * 100;
    ELSE
      -- Goal is to decrease (e.g., weight loss)
      progress_pct := ((goal.starting_value - NEW.value) / (goal.starting_value - goal.target_value)) * 100;
    END IF;

    -- Cap at 100%
    progress_pct := LEAST(progress_pct, 100);
    progress_pct := GREATEST(progress_pct, 0);

    -- Update goal
    UPDATE user_goals
    SET
      current_value = NEW.value,
      progress_percentage = progress_pct,
      updated_at = NOW()
    WHERE id = NEW.goal_id;

    -- Check if goal is completed
    IF progress_pct >= 100 AND goal.status = 'active' THEN
      UPDATE user_goals
      SET
        status = 'completed',
        completed_date = CURRENT_DATE
      WHERE id = NEW.goal_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT ON goal_progress_logs
FOR EACH ROW
EXECUTE FUNCTION update_goal_progress();

-- Function to calculate goal streak
CREATE OR REPLACE FUNCTION calculate_goal_streak(p_goal_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  log_exists BOOLEAN;
BEGIN
  LOOP
    -- Check if there's a log for this date
    SELECT EXISTS(
      SELECT 1 FROM goal_progress_logs
      WHERE goal_id = p_goal_id
        AND log_date = check_date
    ) INTO log_exists;

    IF log_exists THEN
      current_streak := current_streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;

    -- Safety limit
    IF current_streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to update goal streaks (run daily via cron)
CREATE OR REPLACE FUNCTION update_all_goal_streaks()
RETURNS void AS $$
DECLARE
  goal_record RECORD;
  current_streak INTEGER;
BEGIN
  FOR goal_record IN
    SELECT id FROM user_goals WHERE status = 'active'
  LOOP
    current_streak := calculate_goal_streak(goal_record.id);

    UPDATE user_goals
    SET
      streak_days = current_streak,
      best_streak = GREATEST(best_streak, current_streak),
      updated_at = NOW()
    WHERE id = goal_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert sample goal templates
INSERT INTO goal_templates (category_id, title, description, metric_type, typical_duration_weeks, difficulty, target_value_range, milestones_template, success_tips, common_obstacles, recommended_actions, success_rate) VALUES
(
  (SELECT id FROM goal_categories WHERE name = 'weight_loss'),
  'Lose 10kg in 12 weeks',
  'A sustainable weight loss goal with weekly milestones',
  'weight',
  12,
  'medium',
  '{"min": 8, "max": 12, "recommended": 10}'::jsonb,
  '[
    {"title": "Lose 2.5kg", "percentage": 25, "description": "First quarter milestone"},
    {"title": "Lose 5kg", "percentage": 50, "description": "Halfway there!"},
    {"title": "Lose 7.5kg", "percentage": 75, "description": "Home stretch"},
    {"title": "Lose 10kg", "percentage": 100, "description": "Goal achieved!"}
  ]'::jsonb,
  ARRAY[
    'Create a calorie deficit of 500-750 calories per day',
    'Track your food intake daily',
    'Aim for 3-4 workouts per week',
    'Weigh yourself weekly, not daily',
    'Stay hydrated - drink 2-3 liters of water daily',
    'Get 7-9 hours of sleep each night'
  ],
  ARRAY[
    'Plateaus after initial weight loss',
    'Social events and dining out',
    'Stress eating',
    'Lack of motivation',
    'Unrealistic expectations'
  ],
  ARRAY[
    'Calculate your TDEE and create a meal plan',
    'Schedule 4 workout sessions per week',
    'Meal prep on Sundays',
    'Find an accountability partner',
    'Take progress photos every 2 weeks'
  ],
  72.5
),
(
  (SELECT id FROM goal_categories WHERE name = 'muscle_gain'),
  'Gain 5kg of muscle in 16 weeks',
  'Build lean muscle mass through progressive overload',
  'weight',
  16,
  'hard',
  '{"min": 3, "max": 7, "recommended": 5}'::jsonb,
  '[
    {"title": "Gain 1.25kg", "percentage": 25, "description": "Early gains"},
    {"title": "Gain 2.5kg", "percentage": 50, "description": "Halfway milestone"},
    {"title": "Gain 3.75kg", "percentage": 75, "description": "Almost there"},
    {"title": "Gain 5kg", "percentage": 100, "description": "Muscle gained!"}
  ]'::jsonb,
  ARRAY[
    'Eat in a calorie surplus of 300-500 calories',
    'Consume 1.6-2.2g of protein per kg bodyweight',
    'Progressive overload every week',
    'Train each muscle group 2x per week',
    'Recovery is crucial - rest days matter',
    'Track your lifts and increase weight regularly'
  ],
  ARRAY[
    'Not eating enough calories',
    'Insufficient protein intake',
    'Inconsistent training',
    'Poor recovery',
    'Dirty bulking and excess fat gain'
  ],
  ARRAY[
    'Calculate your TDEE and add 300-500 calories',
    'Create a high-protein meal plan',
    'Start a structured program (Push/Pull/Legs or Upper/Lower)',
    'Track your workouts and progressively overload',
    'Take weekly body measurements and photos'
  ],
  68.3
),
(
  (SELECT id FROM goal_categories WHERE name = 'strength'),
  'Increase bench press by 20kg in 12 weeks',
  'Progressive strength program for bench press',
  'weight_lifted',
  12,
  'medium',
  '{"min": 15, "max": 25, "recommended": 20}'::jsonb,
  '[
    {"title": "+5kg", "percentage": 25, "description": "Early strength gains"},
    {"title": "+10kg", "percentage": 50, "description": "Halfway there"},
    {"title": "+15kg", "percentage": 75, "description": "Strong progress"},
    {"title": "+20kg", "percentage": 100, "description": "Strength goal achieved!"}
  ]'::jsonb,
  ARRAY[
    'Follow a structured strength program',
    'Focus on progressive overload',
    'Perfect your form before adding weight',
    'Train bench press 2-3x per week',
    'Include accessory exercises',
    'Adequate protein and recovery'
  ],
  ARRAY[
    'Plateaus',
    'Poor form leading to injury',
    'Overtraining',
    'Insufficient recovery',
    'Weak accessory muscles'
  ],
  ARRAY[
    'Start a proven program like 5/3/1 or nSuns',
    'Record your lifts and track progress',
    'Add volume with accessory work',
    'Work on weak points (triceps, shoulders)',
    'Deload every 4 weeks'
  ],
  75.8
);

-- Row Level Security
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view milestones for accessible goals" ON goal_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_goals
      WHERE id = goal_milestones.goal_id
        AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can create milestones for own goals" ON goal_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_goals
      WHERE id = goal_milestones.goal_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own progress logs" ON goal_progress_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress logs" ON goal_progress_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON goal_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders" ON goal_reminders
  FOR ALL USING (auth.uid() = user_id);
