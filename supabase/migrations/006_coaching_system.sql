-- Coaching System
-- Allows certified trainers to manage clients, assign programs, and track progress

-- Trainer Certifications
CREATE TABLE trainer_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL, -- 'personal_trainer', 'nutrition_specialist', 'strength_coach', etc.
  certification_body TEXT NOT NULL, -- 'NASM', 'ACE', 'ISSA', etc.
  certification_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verification_document_url TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trainer_certifications_user ON trainer_certifications(user_id);
CREATE INDEX idx_trainer_certifications_status ON trainer_certifications(verification_status);

-- Trainer Profiles (extended user profiles for trainers)
CREATE TABLE trainer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  specializations TEXT[], -- ['weight_loss', 'muscle_building', 'athletic_performance', etc.]
  years_experience INTEGER,
  hourly_rate NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  max_clients INTEGER DEFAULT 20,
  is_accepting_clients BOOLEAN DEFAULT true,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_clients_trained INTEGER DEFAULT 0,
  profile_image_url TEXT,
  social_links JSONB, -- {instagram, youtube, website, etc.}
  availability JSONB, -- [{day: 'monday', slots: ['09:00-10:00', '14:00-15:00']}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trainer_profiles_user ON trainer_profiles(user_id);
CREATE INDEX idx_trainer_profiles_specializations ON trainer_profiles USING GIN (specializations);
CREATE INDEX idx_trainer_profiles_rating ON trainer_profiles(rating_avg DESC) WHERE is_accepting_clients = true;

-- Client-Trainer Relationships
CREATE TABLE client_trainer_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- 'pending', 'active', 'paused', 'completed', 'cancelled'
  start_date DATE NOT NULL,
  end_date DATE,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  monthly_fee NUMERIC(10,2),
  billing_cycle TEXT DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
  notes TEXT,
  client_goals JSONB, -- {primary_goal, target_weight, target_body_fat, etc.}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, trainer_id, status)
);

CREATE INDEX idx_client_trainer_client ON client_trainer_relationships(client_id);
CREATE INDEX idx_client_trainer_trainer ON client_trainer_relationships(trainer_id);
CREATE INDEX idx_client_trainer_status ON client_trainer_relationships(status);

-- Training Programs (reusable workout templates created by trainers)
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT, -- 'strength', 'hypertrophy', 'fat_loss', 'athletic', etc.
  difficulty TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  duration_weeks INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  equipment_required TEXT[], -- ['barbell', 'dumbbells', 'machines', etc.]
  target_audience TEXT[], -- ['beginners', 'athletes', 'weight_loss', etc.]
  weekly_structure JSONB NOT NULL, -- [{week: 1, days: [{day: 1, focus: 'push', exercises: [...]}]}]
  nutrition_guidance TEXT,
  supplement_recommendations TEXT,
  is_template BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  price NUMERIC(10,2),
  sales_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_programs_trainer ON training_programs(trainer_id);
CREATE INDEX idx_training_programs_type ON training_programs(program_type);
CREATE INDEX idx_training_programs_public ON training_programs(is_public) WHERE is_public = true;
CREATE INDEX idx_training_programs_rating ON training_programs(rating_avg DESC) WHERE is_public = true;

-- Client Program Assignments
CREATE TABLE client_program_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,
  relationship_id UUID REFERENCES client_trainer_relationships(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  current_week INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  customizations JSONB, -- Trainer-specific modifications to the program
  client_feedback TEXT,
  trainer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_programs_client ON client_program_assignments(client_id);
CREATE INDEX idx_client_programs_trainer ON client_program_assignments(trainer_id);
CREATE INDEX idx_client_programs_status ON client_program_assignments(status);

-- Check-Ins (progress updates between client and trainer)
CREATE TABLE client_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES client_trainer_relationships(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  body_fat_percentage NUMERIC(4,2),
  measurements JSONB, -- {chest, waist, hips, arms, legs, etc.}
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 10),
  client_notes TEXT,
  progress_photos JSONB, -- [{type: 'front', url: '...'}, {type: 'side', url: '...'}]
  trainer_feedback TEXT,
  trainer_recommendations TEXT,
  next_check_in_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_check_ins_client ON client_check_ins(client_id);
CREATE INDEX idx_check_ins_trainer ON client_check_ins(trainer_id);
CREATE INDEX idx_check_ins_date ON client_check_ins(check_in_date DESC);

-- Trainer Messages (communication between trainer and client)
CREATE TABLE trainer_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES client_trainer_relationships(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  attachments JSONB, -- [{name, url, type}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trainer_messages_sender ON trainer_messages(sender_id);
CREATE INDEX idx_trainer_messages_recipient ON trainer_messages(recipient_id);
CREATE INDEX idx_trainer_messages_unread ON trainer_messages(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX idx_trainer_messages_relationship ON trainer_messages(relationship_id);

-- Trainer Reviews
CREATE TABLE trainer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES client_trainer_relationships(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  would_recommend BOOLEAN,
  is_verified BOOLEAN DEFAULT false, -- verified that client actually trained with trainer
  trainer_response TEXT,
  trainer_response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, client_id, relationship_id)
);

CREATE INDEX idx_trainer_reviews_trainer ON trainer_reviews(trainer_id);
CREATE INDEX idx_trainer_reviews_rating ON trainer_reviews(rating DESC);

-- Function to update trainer rating
CREATE OR REPLACE FUNCTION update_trainer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trainer_profiles
  SET
    rating_avg = (SELECT AVG(rating) FROM trainer_reviews WHERE trainer_id = NEW.trainer_id),
    rating_count = (SELECT COUNT(*) FROM trainer_reviews WHERE trainer_id = NEW.trainer_id),
    updated_at = NOW()
  WHERE user_id = NEW.trainer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trainer_rating
AFTER INSERT OR UPDATE ON trainer_reviews
FOR EACH ROW
EXECUTE FUNCTION update_trainer_rating();

-- Function to update program completion percentage
CREATE OR REPLACE FUNCTION update_program_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_workouts INTEGER;
  completed_workouts INTEGER;
  completion_pct NUMERIC(5,2);
BEGIN
  -- Count total workouts in program
  SELECT
    SUM((week_data->'days')::jsonb_array_length)
  INTO total_workouts
  FROM training_programs,
       jsonb_array_elements(weekly_structure) AS week_data
  WHERE id = NEW.program_id;

  -- Count completed workouts for this assignment
  SELECT COUNT(*)
  INTO completed_workouts
  FROM workout_logs
  WHERE user_id = NEW.client_id
    AND created_at >= NEW.start_date
    AND (NEW.end_date IS NULL OR created_at <= NEW.end_date);

  -- Calculate percentage
  IF total_workouts > 0 THEN
    completion_pct := (completed_workouts::NUMERIC / total_workouts) * 100;
    completion_pct := LEAST(completion_pct, 100); -- Cap at 100%
  ELSE
    completion_pct := 0;
  END IF;

  -- Update assignment
  UPDATE client_program_assignments
  SET
    completion_percentage = completion_pct,
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert sample training programs
INSERT INTO training_programs (trainer_id, name, description, program_type, difficulty, duration_weeks, days_per_week, equipment_required, target_audience, weekly_structure, is_public) VALUES
(
  (SELECT id FROM users LIMIT 1), -- Use first user as sample trainer
  'Beginner Full Body Transformation',
  'A comprehensive 12-week program designed for beginners to build strength, lose fat, and develop healthy fitness habits.',
  'general_fitness',
  'beginner',
  12,
  3,
  ARRAY['dumbbells', 'resistance_bands', 'bodyweight'],
  ARRAY['beginners', 'weight_loss', 'general_fitness'],
  '[
    {
      "week": 1,
      "focus": "Movement Foundation",
      "days": [
        {
          "day": 1,
          "name": "Full Body A",
          "exercises": [
            {"name": "Goblet Squat", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"name": "Push-ups", "sets": 3, "reps": "8-10", "rest_seconds": 60},
            {"name": "Dumbbell Row", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"name": "Plank", "sets": 3, "reps": "30s", "rest_seconds": 60}
          ]
        },
        {
          "day": 2,
          "name": "Full Body B",
          "exercises": [
            {"name": "Romanian Deadlift", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"name": "Dumbbell Press", "sets": 3, "reps": "8-10", "rest_seconds": 90},
            {"name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest_seconds": 60},
            {"name": "Russian Twists", "sets": 3, "reps": "20", "rest_seconds": 60}
          ]
        },
        {
          "day": 3,
          "name": "Full Body C",
          "exercises": [
            {"name": "Lunges", "sets": 3, "reps": "10/leg", "rest_seconds": 90},
            {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "8-10", "rest_seconds": 90},
            {"name": "Face Pulls", "sets": 3, "reps": "12-15", "rest_seconds": 60},
            {"name": "Dead Bug", "sets": 3, "reps": "10/side", "rest_seconds": 60}
          ]
        }
      ]
    }
  ]'::jsonb,
  true
);

-- Row Level Security
ALTER TABLE trainer_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_trainer_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own certifications" ON trainer_certifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own certifications" ON trainer_certifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public trainer profiles" ON trainer_profiles
  FOR SELECT USING (true);

CREATE POLICY "Trainers can update own profile" ON trainer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own relationships as client or trainer" ON client_trainer_relationships
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can create relationships as client" ON client_trainer_relationships
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view public programs or own programs" ON training_programs
  FOR SELECT USING (is_public = true OR auth.uid() = trainer_id);

CREATE POLICY "Trainers can create programs" ON training_programs
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Users can view own program assignments" ON client_program_assignments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can view own check-ins" ON client_check_ins
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Clients can create check-ins" ON client_check_ins
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view own messages" ON trainer_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON trainer_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Everyone can view trainer reviews" ON trainer_reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews" ON trainer_reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);
