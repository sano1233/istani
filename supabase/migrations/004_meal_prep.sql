-- Meal Prep Planning System
-- Weekly meal planning, shopping lists, and recipe management

-- Recipes Database
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT, -- 'italian', 'mexican', 'asian', 'american', etc.
  meal_type TEXT[], -- ['breakfast', 'lunch', 'dinner', 'snack']
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 4,
  calories_per_serving INTEGER,
  protein_per_serving NUMERIC(6,2),
  carbs_per_serving NUMERIC(6,2),
  fat_per_serving NUMERIC(6,2),
  ingredients JSONB NOT NULL, -- [{name, amount, unit, notes}]
  instructions TEXT[],
  tags TEXT[], -- ['high-protein', 'low-carb', 'vegetarian', etc.]
  image_url TEXT,
  video_url TEXT,
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recipes_meal_type ON recipes USING GIN (meal_type);
CREATE INDEX idx_recipes_tags ON recipes USING GIN (tags);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = true;
CREATE INDEX idx_recipes_rating ON recipes(rating_avg DESC) WHERE is_public = true;

-- Recipe Ratings
CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings(recipe_id);

-- Meal Plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_calories_per_day INTEGER,
  target_protein_per_day INTEGER,
  target_carbs_per_day INTEGER,
  target_fat_per_day INTEGER,
  dietary_preferences TEXT[], -- ['vegetarian', 'vegan', 'gluten-free', etc.]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_active ON meal_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_meal_plans_dates ON meal_plans(start_date, end_date);

-- Planned Meals (entries in meal plan)
CREATE TABLE planned_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  servings INTEGER DEFAULT 1,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_planned_meals_plan ON planned_meals(meal_plan_id);
CREATE INDEX idx_planned_meals_date ON planned_meals(meal_date);
CREATE INDEX idx_planned_meals_recipe ON planned_meals(recipe_id);

-- Shopping Lists
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_meal_plan ON shopping_lists(meal_plan_id);

-- Shopping List Items
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  amount NUMERIC(10,2),
  unit TEXT,
  category TEXT, -- 'produce', 'meat', 'dairy', 'pantry', etc.
  is_checked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_shopping_list_items_category ON shopping_list_items(category);

-- Favorite Recipes
CREATE TABLE favorite_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_favorite_recipes_user ON favorite_recipes(user_id);

-- Function to generate shopping list from meal plan
CREATE OR REPLACE FUNCTION generate_shopping_list(
  p_meal_plan_id UUID,
  p_user_id UUID,
  p_list_name TEXT DEFAULT 'Weekly Shopping List'
)
RETURNS UUID AS $$
DECLARE
  v_shopping_list_id UUID;
  v_ingredient RECORD;
BEGIN
  -- Create shopping list
  INSERT INTO shopping_lists (user_id, meal_plan_id, name, description)
  VALUES (
    p_user_id,
    p_meal_plan_id,
    p_list_name,
    'Auto-generated from meal plan'
  )
  RETURNING id INTO v_shopping_list_id;

  -- Aggregate ingredients from all planned meals
  INSERT INTO shopping_list_items (shopping_list_id, ingredient_name, amount, unit, category)
  SELECT
    v_shopping_list_id,
    ingredient->>'name',
    SUM((ingredient->>'amount')::numeric * pm.servings),
    ingredient->>'unit',
    COALESCE(ingredient->>'category', 'other')
  FROM planned_meals pm
  JOIN recipes r ON pm.recipe_id = r.id
  CROSS JOIN LATERAL jsonb_array_elements(r.ingredients) AS ingredient
  WHERE pm.meal_plan_id = p_meal_plan_id
    AND pm.is_completed = false
  GROUP BY ingredient->>'name', ingredient->>'unit', ingredient->>'category'
  ORDER BY COALESCE(ingredient->>'category', 'other'), ingredient->>'name';

  RETURN v_shopping_list_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update recipe rating
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipes
  SET
    rating_avg = (SELECT AVG(rating) FROM recipe_ratings WHERE recipe_id = NEW.recipe_id),
    rating_count = (SELECT COUNT(*) FROM recipe_ratings WHERE recipe_id = NEW.recipe_id),
    updated_at = NOW()
  WHERE id = NEW.recipe_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recipe_rating
AFTER INSERT OR UPDATE ON recipe_ratings
FOR EACH ROW
EXECUTE FUNCTION update_recipe_rating();

-- Insert sample recipes
INSERT INTO recipes (name, description, meal_type, difficulty, prep_time_minutes, cook_time_minutes, servings, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, ingredients, instructions, tags, is_public) VALUES
(
  'High-Protein Chicken Bowl',
  'Grilled chicken with quinoa and vegetables',
  ARRAY['lunch', 'dinner'],
  'easy',
  15,
  25,
  4,
  450,
  35,
  40,
  12,
  '[
    {"name": "chicken breast", "amount": 500, "unit": "g", "category": "meat"},
    {"name": "quinoa", "amount": 200, "unit": "g", "category": "pantry"},
    {"name": "broccoli", "amount": 300, "unit": "g", "category": "produce"},
    {"name": "olive oil", "amount": 2, "unit": "tbsp", "category": "pantry"},
    {"name": "garlic", "amount": 2, "unit": "cloves", "category": "produce"}
  ]'::jsonb,
  ARRAY[
    'Cook quinoa according to package instructions',
    'Season chicken with salt, pepper, and garlic',
    'Grill chicken for 6-7 minutes per side',
    'Steam broccoli until tender',
    'Assemble bowls with quinoa, chicken, and broccoli',
    'Drizzle with olive oil'
  ],
  ARRAY['high-protein', 'balanced', 'meal-prep-friendly'],
  true
),
(
  'Overnight Oats',
  'Easy make-ahead breakfast with oats and fruit',
  ARRAY['breakfast'],
  'easy',
  5,
  0,
  1,
  350,
  12,
  55,
  8,
  '[
    {"name": "rolled oats", "amount": 50, "unit": "g", "category": "pantry"},
    {"name": "milk", "amount": 200, "unit": "ml", "category": "dairy"},
    {"name": "banana", "amount": 1, "unit": "whole", "category": "produce"},
    {"name": "honey", "amount": 1, "unit": "tbsp", "category": "pantry"},
    {"name": "chia seeds", "amount": 1, "unit": "tbsp", "category": "pantry"}
  ]'::jsonb,
  ARRAY[
    'Combine oats and milk in a jar',
    'Mash banana and mix in',
    'Add honey and chia seeds',
    'Stir well and refrigerate overnight',
    'Top with fresh fruit in the morning'
  ],
  ARRAY['breakfast', 'meal-prep', 'vegetarian'],
  true
),
(
  'Greek Salad with Grilled Salmon',
  'Mediterranean-style salad with omega-3 rich salmon',
  ARRAY['lunch', 'dinner'],
  'medium',
  20,
  15,
  2,
  520,
  38,
  25,
  30,
  '[
    {"name": "salmon fillet", "amount": 300, "unit": "g", "category": "meat"},
    {"name": "cucumber", "amount": 1, "unit": "whole", "category": "produce"},
    {"name": "tomatoes", "amount": 200, "unit": "g", "category": "produce"},
    {"name": "feta cheese", "amount": 100, "unit": "g", "category": "dairy"},
    {"name": "olives", "amount": 50, "unit": "g", "category": "pantry"},
    {"name": "olive oil", "amount": 3, "unit": "tbsp", "category": "pantry"},
    {"name": "lemon", "amount": 1, "unit": "whole", "category": "produce"}
  ]'::jsonb,
  ARRAY[
    'Season salmon with salt, pepper, and lemon',
    'Grill salmon for 4-5 minutes per side',
    'Chop cucumber, tomatoes, and olives',
    'Combine vegetables in a bowl',
    'Add crumbled feta',
    'Dress with olive oil and lemon juice',
    'Serve salmon on top of salad'
  ],
  ARRAY['high-protein', 'mediterranean', 'low-carb', 'omega-3'],
  true
);

-- Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public recipes" ON recipes
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
