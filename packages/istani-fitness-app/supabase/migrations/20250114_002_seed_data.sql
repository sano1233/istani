-- ISTANI Fitness Enterprise - Seed Data
-- Migration: 20250114_002_seed_data
-- Description: Inserts sample exercises, workout plans, and meal plans

-- Insert sample exercises
INSERT INTO public.exercises (name, description, category, muscle_groups, equipment, difficulty, is_public) VALUES
-- Chest exercises
('Bench Press', 'Compound chest exercise using a barbell', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'intermediate', true),
('Push-ups', 'Bodyweight chest exercise', 'strength', ARRAY['chest', 'triceps', 'core'], ARRAY['none'], 'beginner', true),
('Dumbbell Flyes', 'Isolation exercise for chest', 'strength', ARRAY['chest'], ARRAY['dumbbells', 'bench'], 'intermediate', true),

-- Back exercises
('Pull-ups', 'Upper back and lat exercise', 'strength', ARRAY['lats', 'biceps', 'upper back'], ARRAY['pull-up bar'], 'intermediate', true),
('Barbell Rows', 'Compound back exercise', 'strength', ARRAY['lats', 'middle back', 'biceps'], ARRAY['barbell'], 'intermediate', true),
('Deadlift', 'Full body compound exercise', 'strength', ARRAY['lower back', 'glutes', 'hamstrings', 'traps'], ARRAY['barbell'], 'advanced', true),

-- Leg exercises
('Squats', 'Compound leg exercise', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['barbell', 'rack'], 'intermediate', true),
('Lunges', 'Single-leg exercise', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['dumbbells'], 'beginner', true),
('Leg Press', 'Machine-based leg exercise', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['leg press machine'], 'beginner', true),

-- Shoulder exercises
('Overhead Press', 'Compound shoulder exercise', 'strength', ARRAY['shoulders', 'triceps'], ARRAY['barbell'], 'intermediate', true),
('Lateral Raises', 'Shoulder isolation exercise', 'strength', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', true),
('Face Pulls', 'Rear delt and upper back exercise', 'strength', ARRAY['rear delts', 'upper back'], ARRAY['cable machine'], 'beginner', true),

-- Arm exercises
('Bicep Curls', 'Bicep isolation exercise', 'strength', ARRAY['biceps'], ARRAY['dumbbells'], 'beginner', true),
('Tricep Dips', 'Tricep compound exercise', 'strength', ARRAY['triceps', 'chest'], ARRAY['dip bars'], 'intermediate', true),
('Hammer Curls', 'Bicep and forearm exercise', 'strength', ARRAY['biceps', 'forearms'], ARRAY['dumbbells'], 'beginner', true),

-- Core exercises
('Plank', 'Isometric core exercise', 'strength', ARRAY['core', 'abs'], ARRAY['none'], 'beginner', true),
('Russian Twists', 'Oblique exercise', 'strength', ARRAY['obliques', 'core'], ARRAY['none'], 'beginner', true),
('Hanging Leg Raises', 'Advanced ab exercise', 'strength', ARRAY['abs', 'hip flexors'], ARRAY['pull-up bar'], 'advanced', true),

-- Cardio exercises
('Running', 'Cardiovascular endurance', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['none'], 'beginner', true),
('Cycling', 'Low-impact cardio', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['bike'], 'beginner', true),
('Jump Rope', 'High-intensity cardio', 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY['jump rope'], 'intermediate', true),
('Rowing', 'Full body cardio', 'cardio', ARRAY['back', 'legs', 'arms', 'cardiovascular'], ARRAY['rowing machine'], 'intermediate', true),

-- Flexibility exercises
('Yoga Flow', 'Full body flexibility and balance', 'flexibility', ARRAY['full body'], ARRAY['yoga mat'], 'beginner', true),
('Static Stretching', 'Post-workout stretching routine', 'flexibility', ARRAY['full body'], ARRAY['none'], 'beginner', true),
('Foam Rolling', 'Myofascial release', 'flexibility', ARRAY['full body'], ARRAY['foam roller'], 'beginner', true);

-- Insert sample workout plans
DO $$
DECLARE
    beginner_plan_id UUID;
    intermediate_plan_id UUID;
    advanced_plan_id UUID;
    cardio_plan_id UUID;
BEGIN
    -- Beginner Full Body Workout (3 days/week)
    INSERT INTO public.workout_plans (name, description, difficulty, days_per_week, duration_weeks, is_public)
    VALUES ('Beginner Full Body', 'Perfect for those new to weight training. Focuses on compound movements and building a foundation.', 'beginner', 3, 8, true)
    RETURNING id INTO beginner_plan_id;

    -- Add exercises to beginner plan - Day 1
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index)
    SELECT beginner_plan_id, id, 1, 3, 12, 90, ROW_NUMBER() OVER ()
    FROM public.exercises
    WHERE name IN ('Squats', 'Push-ups', 'Barbell Rows', 'Plank');

    -- Day 2
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index)
    SELECT beginner_plan_id, id, 2, 3, 12, 90, ROW_NUMBER() OVER ()
    FROM public.exercises
    WHERE name IN ('Leg Press', 'Overhead Press', 'Bicep Curls', 'Russian Twists');

    -- Day 3
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index)
    SELECT beginner_plan_id, id, 3, 3, 12, 90, ROW_NUMBER() OVER ()
    FROM public.exercises
    WHERE name IN ('Lunges', 'Dumbbell Flyes', 'Lateral Raises', 'Static Stretching');

    -- Intermediate Push/Pull/Legs Split (5 days/week)
    INSERT INTO public.workout_plans (name, description, difficulty, days_per_week, duration_weeks, is_public)
    VALUES ('PPL Intermediate', 'Push/Pull/Legs split for intermediate lifters. Focuses on progressive overload.', 'intermediate', 5, 12, true)
    RETURNING id INTO intermediate_plan_id;

    -- Push day
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index)
    SELECT intermediate_plan_id, id, 1, 4, 8, 120, ROW_NUMBER() OVER ()
    FROM public.exercises
    WHERE name IN ('Bench Press', 'Overhead Press', 'Dumbbell Flyes', 'Tricep Dips');

    -- Pull day
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index)
    SELECT intermediate_plan_id, id, 2, 4, 8, 120, ROW_NUMBER() OVER ()
    FROM public.exercises
    WHERE name IN ('Deadlift', 'Pull-ups', 'Barbell Rows', 'Bicep Curls');

    -- Leg day
    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, reps, rest_seconds, order_index)
    SELECT intermediate_plan_id, id, 3, 4, 10, 120, ROW_NUMBER() OVER ()
    FROM public.exercises
    WHERE name IN ('Squats', 'Lunges', 'Leg Press', 'Hanging Leg Raises');

    -- Advanced Strength Program (6 days/week)
    INSERT INTO public.workout_plans (name, description, difficulty, days_per_week, duration_weeks, is_public)
    VALUES ('Advanced Strength', 'High-volume strength program for advanced lifters. Requires solid form and recovery.', 'advanced', 6, 16, true)
    RETURNING id INTO advanced_plan_id;

    -- Cardio & Conditioning Plan (4 days/week)
    INSERT INTO public.workout_plans (name, description, difficulty, days_per_week, duration_weeks, is_public)
    VALUES ('Cardio Conditioning', 'Cardio-focused program for fat loss and cardiovascular health.', 'intermediate', 4, 8, true)
    RETURNING id INTO cardio_plan_id;

    INSERT INTO public.workout_plan_exercises (workout_plan_id, exercise_id, day_number, sets, rest_seconds, order_index)
    SELECT cardio_plan_id, id, 1, 1, 180, 1
    FROM public.exercises
    WHERE name IN ('Running', 'Jump Rope', 'Yoga Flow');

END $$;

-- Insert sample meal plans
DO $$
DECLARE
    cutting_plan_id UUID;
    bulking_plan_id UUID;
    maintenance_plan_id UUID;
BEGIN
    -- Cutting Plan (calorie deficit)
    INSERT INTO public.meal_plans (name, description, daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g, is_public)
    VALUES (
        'Cutting Plan - 2000 Cal',
        'Moderate calorie deficit for fat loss while preserving muscle. High protein, moderate carbs and fats.',
        2000, 180, 150, 60, true
    ) RETURNING id INTO cutting_plan_id;

    -- Bulking Plan (calorie surplus)
    INSERT INTO public.meal_plans (name, description, daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g, is_public)
    VALUES (
        'Lean Bulk - 3000 Cal',
        'Calorie surplus for muscle gain. High protein and carbs, moderate fats.',
        3000, 200, 400, 80, true
    ) RETURNING id INTO bulking_plan_id;

    -- Maintenance Plan
    INSERT INTO public.meal_plans (name, description, daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g, is_public)
    VALUES (
        'Maintenance - 2500 Cal',
        'Balanced macros for weight maintenance and body recomposition.',
        2500, 180, 280, 75, true
    ) RETURNING id INTO maintenance_plan_id;

END $$;

-- Create analytics views for users
CREATE OR REPLACE VIEW public.user_workout_stats AS
SELECT
    user_id,
    COUNT(DISTINCT id) as total_workouts,
    SUM(duration_minutes) as total_minutes,
    SUM(calories_burned) as total_calories,
    AVG(rating) as avg_rating,
    MAX(completed_at) as last_workout_date
FROM public.workout_sessions
WHERE completed_at IS NOT NULL
GROUP BY user_id;

CREATE OR REPLACE VIEW public.user_progress_summary AS
SELECT
    user_id,
    MIN(weight_kg) as min_weight,
    MAX(weight_kg) as max_weight,
    (SELECT weight_kg FROM public.progress_entries pe2
     WHERE pe2.user_id = pe1.user_id
     ORDER BY recorded_at DESC LIMIT 1) as current_weight,
    (SELECT weight_kg FROM public.progress_entries pe2
     WHERE pe2.user_id = pe1.user_id
     ORDER BY recorded_at ASC LIMIT 1) as starting_weight,
    COUNT(*) as total_entries
FROM public.progress_entries pe1
GROUP BY user_id;

-- Grant view permissions
GRANT SELECT ON public.user_workout_stats TO authenticated;
GRANT SELECT ON public.user_progress_summary TO authenticated;

-- Add RLS policies for views
ALTER VIEW public.user_workout_stats SET (security_invoker = on);
ALTER VIEW public.user_progress_summary SET (security_invoker = on);

COMMENT ON TABLE public.exercises IS 'Library of exercises with descriptions, muscle groups, and equipment requirements';
COMMENT ON TABLE public.workout_plans IS 'Structured workout programs with exercises organized by days';
COMMENT ON TABLE public.workout_sessions IS 'Actual workout sessions logged by users';
COMMENT ON TABLE public.meals IS 'Individual meals logged by users with nutritional information';
COMMENT ON TABLE public.progress_entries IS 'User progress tracking including weight, measurements, and photos';
