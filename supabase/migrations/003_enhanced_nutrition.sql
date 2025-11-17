-- ============================================================================
-- ISTANI Enhanced Nutrition & Social Features Migration
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USDA FOOD DATABASE CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS usda_foods (
  fdc_id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  brand_name TEXT,
  brand_owner TEXT,
  serving_size DECIMAL,
  serving_unit TEXT,
  household_serving TEXT,

  -- Macronutrients
  calories DECIMAL,
  protein_g DECIMAL,
  carbs_g DECIMAL,
  fat_g DECIMAL,
  saturated_fat_g DECIMAL,
  trans_fat_g DECIMAL,
  polyunsaturated_fat_g DECIMAL,
  monounsaturated_fat_g DECIMAL,
  cholesterol_mg DECIMAL,
  fiber_g DECIMAL,
  sugar_g DECIMAL,
  added_sugar_g DECIMAL,

  -- Micronutrients - Vitamins
  vitamin_a_mcg DECIMAL,
  vitamin_c_mg DECIMAL,
  vitamin_d_mcg DECIMAL,
  vitamin_e_mg DECIMAL,
  vitamin_k_mcg DECIMAL,
  thiamin_b1_mg DECIMAL,
  riboflavin_b2_mg DECIMAL,
  niacin_b3_mg DECIMAL,
  vitamin_b6_mg DECIMAL,
  folate_mcg DECIMAL,
  vitamin_b12_mcg DECIMAL,
  pantothenic_acid_mg DECIMAL,
  biotin_mcg DECIMAL,
  choline_mg DECIMAL,

  -- Micronutrients - Minerals
  calcium_mg DECIMAL,
  iron_mg DECIMAL,
  magnesium_mg DECIMAL,
  phosphorus_mg DECIMAL,
  potassium_mg DECIMAL,
  sodium_mg DECIMAL,
  zinc_mg DECIMAL,
  copper_mg DECIMAL,
  selenium_mcg DECIMAL,
  manganese_mg DECIMAL,
  chromium_mcg DECIMAL,
  iodine_mcg DECIMAL,

  -- Other nutrients
  omega3_g DECIMAL,
  omega6_g DECIMAL,
  caffeine_mg DECIMAL,
  alcohol_g DECIMAL,
  water_g DECIMAL,

  -- Additional data
  barcode TEXT,
  ingredients TEXT,
  allergens TEXT[],
  data_source TEXT DEFAULT 'usda', -- 'usda', 'branded', 'user'
  verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usda_foods_description ON usda_foods USING gin(to_tsvector('english', description));
CREATE INDEX idx_usda_foods_barcode ON usda_foods(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_usda_foods_brand ON usda_foods(brand_name) WHERE brand_name IS NOT NULL;

-- ============================================================================
-- MICRONUTRIENT DAILY INTAKE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS micronutrient_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Vitamins
  vitamin_a_mcg DECIMAL DEFAULT 0,
  vitamin_c_mg DECIMAL DEFAULT 0,
  vitamin_d_mcg DECIMAL DEFAULT 0,
  vitamin_e_mg DECIMAL DEFAULT 0,
  vitamin_k_mcg DECIMAL DEFAULT 0,
  thiamin_b1_mg DECIMAL DEFAULT 0,
  riboflavin_b2_mg DECIMAL DEFAULT 0,
  niacin_b3_mg DECIMAL DEFAULT 0,
  vitamin_b6_mg DECIMAL DEFAULT 0,
  folate_mcg DECIMAL DEFAULT 0,
  vitamin_b12_mcg DECIMAL DEFAULT 0,
  pantothenic_acid_mg DECIMAL DEFAULT 0,
  biotin_mcg DECIMAL DEFAULT 0,
  choline_mg DECIMAL DEFAULT 0,

  -- Minerals
  calcium_mg DECIMAL DEFAULT 0,
  iron_mg DECIMAL DEFAULT 0,
  magnesium_mg DECIMAL DEFAULT 0,
  phosphorus_mg DECIMAL DEFAULT 0,
  potassium_mg DECIMAL DEFAULT 0,
  sodium_mg DECIMAL DEFAULT 0,
  zinc_mg DECIMAL DEFAULT 0,
  copper_mg DECIMAL DEFAULT 0,
  selenium_mcg DECIMAL DEFAULT 0,
  manganese_mg DECIMAL DEFAULT 0,
  chromium_mcg DECIMAL DEFAULT 0,
  iodine_mcg DECIMAL DEFAULT 0,

  -- Other
  omega3_g DECIMAL DEFAULT 0,
  omega6_g DECIMAL DEFAULT 0,
  fiber_g DECIMAL DEFAULT 0,
  sugar_g DECIMAL DEFAULT 0,
  caffeine_mg DECIMAL DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, date)
);

CREATE INDEX idx_micronutrient_intake_user_date ON micronutrient_intake(user_id, date DESC);

-- Enable RLS
ALTER TABLE micronutrient_intake ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own micronutrient intake"
  ON micronutrient_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own micronutrient intake"
  ON micronutrient_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own micronutrient intake"
  ON micronutrient_intake FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own micronutrient intake"
  ON micronutrient_intake FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ENHANCED MEALS TABLE (Add FDC ID reference)
-- ============================================================================

ALTER TABLE meals ADD COLUMN IF NOT EXISTS fdc_id INTEGER REFERENCES usda_foods(fdc_id);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS serving_size DECIMAL;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS serving_unit TEXT;

-- ============================================================================
-- RECIPES & MEAL PLANNING
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER DEFAULT 1,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine TEXT,
  meal_type TEXT, -- breakfast, lunch, dinner, snack, dessert
  instructions TEXT[],

  -- Calculated nutrition per serving
  calories_per_serving DECIMAL,
  protein_per_serving DECIMAL,
  carbs_per_serving DECIMAL,
  fat_per_serving DECIMAL,
  fiber_per_serving DECIMAL,

  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe Ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  fdc_id INTEGER REFERENCES usda_foods(fdc_id),
  custom_food_name TEXT, -- For foods not in USDA database
  amount DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

-- ============================================================================
-- MEAL PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_calorie_target DECIMAL,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(user_id, start_date, end_date);

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id);

-- Meal Plan Items
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  time_of_day TIME,

  -- Can reference either recipe or USDA food
  recipe_id UUID REFERENCES recipes(id),
  fdc_id INTEGER REFERENCES usda_foods(fdc_id),

  amount DECIMAL,
  unit TEXT,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_date ON meal_plan_items(meal_plan_id, date);

-- ============================================================================
-- DEVICE INTEGRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'apple_health', 'google_fit', 'fitbit', 'garmin', 'oura', 'whoop', 'strava'
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  enabled BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP,
  sync_frequency TEXT DEFAULT 'hourly', -- 'realtime', 'hourly', 'daily'

  -- Sync preferences
  sync_workouts BOOLEAN DEFAULT TRUE,
  sync_nutrition BOOLEAN DEFAULT TRUE,
  sync_steps BOOLEAN DEFAULT TRUE,
  sync_heart_rate BOOLEAN DEFAULT TRUE,
  sync_sleep BOOLEAN DEFAULT TRUE,
  sync_weight BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, provider)
);

CREATE INDEX idx_device_integrations_user ON device_integrations(user_id);

-- Enable RLS
ALTER TABLE device_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own device integrations"
  ON device_integrations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SOCIAL FEATURES
-- ============================================================================

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,

  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON friendships(friend_id, status);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('steps', 'workouts', 'water', 'streak', 'distance', 'calories')),
  target_value INTEGER NOT NULL,
  unit TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_challenges_public ON challenges(is_public) WHERE is_public = TRUE;

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_value DECIMAL DEFAULT 0,
  rank INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  joined_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id, rank);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);

-- Enable RLS
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view challenge participants"
  ON challenge_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenges c
      WHERE c.id = challenge_id
      AND (c.is_public = TRUE OR c.created_by = auth.uid())
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'workout', 'achievement', 'weight_update', 'friend_joined', 'challenge_completed'
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('private', 'friends', 'public')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Reference to related entity
  related_workout_id UUID,
  related_achievement_id UUID,
  related_challenge_id UUID,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_visibility ON activity_feed(visibility, created_at DESC);

-- Enable RLS
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant activity feed"
  ON activity_feed FOR SELECT
  USING (
    visibility = 'public'
    OR user_id = auth.uid()
    OR (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_id = auth.uid() AND friend_id = activity_feed.user_id AND status = 'accepted')
      OR (friend_id = auth.uid() AND user_id = activity_feed.user_id AND status = 'accepted')
    ))
  );

CREATE POLICY "Users can create own activity feed items"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PREMIUM SUBSCRIPTION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update recipe nutrition when ingredients change
CREATE OR REPLACE FUNCTION update_recipe_nutrition()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes r
  SET
    calories_per_serving = COALESCE((
      SELECT SUM(
        CASE
          WHEN ri.fdc_id IS NOT NULL THEN
            (uf.calories * ri.amount / NULLIF(uf.serving_size, 0))
          ELSE 0
        END
      ) / NULLIF(r.servings, 0)
      FROM recipe_ingredients ri
      LEFT JOIN usda_foods uf ON ri.fdc_id = uf.fdc_id
      WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ), 0),
    protein_per_serving = COALESCE((
      SELECT SUM(
        CASE
          WHEN ri.fdc_id IS NOT NULL THEN
            (uf.protein_g * ri.amount / NULLIF(uf.serving_size, 0))
          ELSE 0
        END
      ) / NULLIF(r.servings, 0)
      FROM recipe_ingredients ri
      LEFT JOIN usda_foods uf ON ri.fdc_id = uf.fdc_id
      WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ), 0),
    carbs_per_serving = COALESCE((
      SELECT SUM(
        CASE
          WHEN ri.fdc_id IS NOT NULL THEN
            (uf.carbs_g * ri.amount / NULLIF(uf.serving_size, 0))
          ELSE 0
        END
      ) / NULLIF(r.servings, 0)
      FROM recipe_ingredients ri
      LEFT JOIN usda_foods uf ON ri.fdc_id = uf.fdc_id
      WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ), 0),
    fat_per_serving = COALESCE((
      SELECT SUM(
        CASE
          WHEN ri.fdc_id IS NOT NULL THEN
            (uf.fat_g * ri.amount / NULLIF(uf.serving_size, 0))
          ELSE 0
        END
      ) / NULLIF(r.servings, 0)
      FROM recipe_ingredients ri
      LEFT JOIN usda_foods uf ON ri.fdc_id = uf.fdc_id
      WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ), 0),
    updated_at = NOW()
  WHERE r.id = COALESCE(NEW.recipe_id, OLD.recipe_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recipe_nutrition
AFTER INSERT OR UPDATE OR DELETE ON recipe_ingredients
FOR EACH ROW
EXECUTE FUNCTION update_recipe_nutrition();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_micronutrient_intake_updated_at
BEFORE UPDATE ON micronutrient_intake
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON meal_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_integrations_updated_at
BEFORE UPDATE ON device_integrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON TABLE usda_foods IS 'Cached USDA FoodData Central nutrition database';
COMMENT ON TABLE micronutrient_intake IS 'Daily micronutrient intake tracking';
COMMENT ON TABLE recipes IS 'User-created recipes with auto-calculated nutrition';
COMMENT ON TABLE meal_plans IS 'Weekly/monthly meal planning';
COMMENT ON TABLE device_integrations IS 'Third-party fitness device connections';
COMMENT ON TABLE friendships IS 'Social connections between users';
COMMENT ON TABLE challenges IS 'Fitness challenges and competitions';
COMMENT ON TABLE subscriptions IS 'Premium subscription management';
