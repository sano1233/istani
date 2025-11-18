-- ============================================
-- ISTANI Production Database Optimizations
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For UUID generation

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Workouts table
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date DESC);

-- Workout exercises
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises(exercise_id);

-- Nutrition logs
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_id ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_date ON nutrition_logs(log_date DESC);

-- Meals
CREATE INDEX IF NOT EXISTS idx_meals_nutrition_log ON meals(nutrition_log_id);
CREATE INDEX IF NOT EXISTS idx_meals_user ON meals(user_id);

-- Water intake
CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_intake(user_id, intake_date DESC);

-- Body measurements
CREATE INDEX IF NOT EXISTS idx_measurements_user_date ON body_measurements(user_id, measurement_date DESC);

-- Orders (e-commerce)
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripe_session_id);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Coaching sessions
CREATE INDEX IF NOT EXISTS idx_coaching_user ON coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_status ON coaching_sessions(status);
CREATE INDEX IF NOT EXISTS idx_coaching_date ON coaching_sessions(session_date);

-- AI recommendations
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_date ON ai_recommendations(created_at DESC);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Find user's workouts in date range
CREATE INDEX IF NOT EXISTS idx_workouts_user_date_range ON workouts(user_id, workout_date DESC)
WHERE deleted_at IS NULL;

-- Find user's nutrition logs in date range
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date_range ON nutrition_logs(user_id, log_date DESC);

-- Active products by category
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(category_id, is_active)
WHERE is_active = true;

-- Pending orders
CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(user_id, status, created_at DESC)
WHERE status IN ('pending', 'processing');

-- ============================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================

-- Product search
CREATE INDEX IF NOT EXISTS idx_products_search ON products
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Exercise search
CREATE INDEX IF NOT EXISTS idx_exercises_search ON exercises
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- OPTIMIZE AUTOVACUUM
-- ============================================

-- High-traffic tables
ALTER TABLE workouts SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE nutrition_logs SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE meals SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

-- ============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- User activity summary (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_summary AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT w.id) as total_workouts,
  COUNT(DISTINCT nl.id) as total_nutrition_logs,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as total_revenue,
  MAX(w.workout_date) as last_workout_date,
  MAX(nl.log_date) as last_nutrition_log_date,
  MAX(o.created_at) as last_order_date,
  u.created_at as user_since
FROM users u
LEFT JOIN workouts w ON u.id = w.user_id AND w.deleted_at IS NULL
LEFT JOIN nutrition_logs nl ON u.id = nl.user_id
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
GROUP BY u.id, u.email, u.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_summary(user_id);

-- Product performance (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS product_performance AS
SELECT
  p.id as product_id,
  p.name,
  p.category_id,
  COUNT(DISTINCT oi.order_id) as total_orders,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue,
  AVG(oi.price) as avg_price,
  MAX(o.created_at) as last_sold_at
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_performance_id ON product_performance(product_id);

-- ============================================
-- FUNCTIONS TO REFRESH MATERIALIZED VIEWS
-- ============================================

CREATE OR REPLACE FUNCTION refresh_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_performance;
END;
$$;

-- ============================================
-- SCHEDULED TASKS (if using pg_cron)
-- ============================================

-- Uncomment if pg_cron is available
-- SELECT cron.schedule('refresh-analytics', '0 2 * * *', 'SELECT refresh_analytics()');

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Workouts policies
CREATE POLICY IF NOT EXISTS "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Nutrition logs policies
CREATE POLICY IF NOT EXISTS "Users can view own nutrition logs"
  ON nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own nutrition logs"
  ON nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own nutrition logs"
  ON nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders policies (read-only after creation)
CREATE POLICY IF NOT EXISTS "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Products are public (read-only)
CREATE POLICY IF NOT EXISTS "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- ============================================
-- QUERY PERFORMANCE MONITORING
-- ============================================

-- View slow queries (requires pg_stat_statements)
CREATE OR REPLACE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 50;

-- ============================================
-- TABLE STATISTICS
-- ============================================

CREATE OR REPLACE VIEW table_sizes AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================

-- Run initial vacuum and analyze
VACUUM ANALYZE;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Database optimization complete!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Monitor slow_queries view for performance issues';
  RAISE NOTICE '2. Schedule daily refresh of materialized views';
  RAISE NOTICE '3. Review table_sizes view monthly';
  RAISE NOTICE '4. Set up connection pooling in application';
  RAISE NOTICE '5. Monitor pg_stat_statements for query optimization';
END $$;
