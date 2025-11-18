-- Workout Video Library System
-- Video exercises, playlists, and viewing history

-- Exercise Videos Table
CREATE TABLE exercise_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube, Vimeo, or uploaded video URL
  thumbnail_url TEXT,
  duration_seconds INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  equipment_needed TEXT[], -- ['dumbbells', 'barbell', 'resistance_band']
  muscle_groups TEXT[], -- ['chest', 'back', 'legs', 'arms', 'shoulders', 'core']
  video_type TEXT DEFAULT 'tutorial', -- 'tutorial', 'workout', 'demonstration', 'motivation'
  instructor_name TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  tags TEXT[], -- ['strength', 'cardio', 'flexibility', 'hiit']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercise_videos_exercise ON exercise_videos(exercise_id);
CREATE INDEX idx_exercise_videos_difficulty ON exercise_videos(difficulty);
CREATE INDEX idx_exercise_videos_muscle_groups ON exercise_videos USING GIN (muscle_groups);
CREATE INDEX idx_exercise_videos_tags ON exercise_videos USING GIN (tags);
CREATE INDEX idx_exercise_videos_views ON exercise_videos(views_count DESC);
CREATE INDEX idx_exercise_videos_premium ON exercise_videos(is_premium) WHERE is_premium = false;

-- Video Playlists
CREATE TABLE video_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  total_duration_seconds INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_playlists_user ON video_playlists(user_id);
CREATE INDEX idx_video_playlists_public ON video_playlists(is_public) WHERE is_public = true;

-- Playlist Videos (many-to-many)
CREATE TABLE playlist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES video_playlists(id) ON DELETE CASCADE,
  video_id UUID REFERENCES exercise_videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order in playlist
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, video_id)
);

CREATE INDEX idx_playlist_videos_playlist ON playlist_videos(playlist_id, position);
CREATE INDEX idx_playlist_videos_video ON playlist_videos(video_id);

-- Video Viewing History
CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES exercise_videos(id) ON DELETE CASCADE,
  watch_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_position_seconds INTEGER DEFAULT 0,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_views_user ON video_views(user_id, viewed_at DESC);
CREATE INDEX idx_video_views_video ON video_views(video_id);

-- Video Likes
CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES exercise_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_likes_user ON video_likes(user_id);
CREATE INDEX idx_video_likes_video ON video_likes(video_id);

-- Video Comments
CREATE TABLE video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES exercise_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_comments_video ON video_comments(video_id, created_at DESC);
CREATE INDEX idx_video_comments_user ON video_comments(user_id);

-- Function to update video views count
CREATE OR REPLACE FUNCTION increment_video_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE exercise_videos
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = NEW.video_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_video_views
AFTER INSERT ON video_views
FOR EACH ROW
EXECUTE FUNCTION increment_video_views();

-- Function to update video likes count
CREATE OR REPLACE FUNCTION update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE exercise_videos
    SET likes_count = likes_count + 1,
        updated_at = NOW()
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE exercise_videos
    SET likes_count = GREATEST(0, likes_count - 1),
        updated_at = NOW()
    WHERE id = OLD.video_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_likes
AFTER INSERT OR DELETE ON video_likes
FOR EACH ROW
EXECUTE FUNCTION update_video_likes_count();

-- Function to update playlist stats
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_playlist_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_playlist_id := NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_playlist_id := OLD.playlist_id;
  END IF;

  UPDATE video_playlists vp
  SET
    video_count = (
      SELECT COUNT(*)
      FROM playlist_videos
      WHERE playlist_id = v_playlist_id
    ),
    total_duration_seconds = (
      SELECT COALESCE(SUM(ev.duration_seconds), 0)
      FROM playlist_videos pv
      JOIN exercise_videos ev ON pv.video_id = ev.id
      WHERE pv.playlist_id = v_playlist_id
    ),
    updated_at = NOW()
  WHERE vp.id = v_playlist_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_playlist_stats
AFTER INSERT OR DELETE ON playlist_videos
FOR EACH ROW
EXECUTE FUNCTION update_playlist_stats();

-- Insert sample workout videos
INSERT INTO exercise_videos (title, description, video_url, thumbnail_url, duration_seconds, difficulty, equipment_needed, muscle_groups, video_type, instructor_name, tags) VALUES
(
  'Perfect Push-Up Form Tutorial',
  'Learn the proper technique for push-ups to maximize muscle activation and prevent injury',
  'https://youtube.com/watch?v=example1',
  'https://img.youtube.com/vi/example1/mqdefault.jpg',
  300,
  'beginner',
  ARRAY['bodyweight'],
  ARRAY['chest', 'arms', 'core'],
  'tutorial',
  'Coach Mike',
  ARRAY['strength', 'bodyweight', 'chest']
),
(
  '20-Minute HIIT Full Body Workout',
  'High-intensity interval training targeting all major muscle groups',
  'https://youtube.com/watch?v=example2',
  'https://img.youtube.com/vi/example2/mqdefault.jpg',
  1200,
  'intermediate',
  ARRAY['dumbbells'],
  ARRAY['chest', 'back', 'legs', 'arms', 'shoulders', 'core'],
  'workout',
  'Coach Sarah',
  ARRAY['hiit', 'cardio', 'full-body', 'fat-loss']
),
(
  'Squat Technique Breakdown',
  'Master the king of all exercises with this comprehensive squat tutorial',
  'https://youtube.com/watch?v=example3',
  'https://img.youtube.com/vi/example3/mqdefault.jpg',
  450,
  'beginner',
  ARRAY['barbell'],
  ARRAY['legs', 'core'],
  'tutorial',
  'Coach Alex',
  ARRAY['strength', 'legs', 'powerlifting']
),
(
  'Advanced Core Training Circuit',
  'Challenge your abs with this intense core workout',
  'https://youtube.com/watch?v=example4',
  'https://img.youtube.com/vi/example4/mqdefault.jpg',
  900,
  'advanced',
  ARRAY['bodyweight', 'resistance_band'],
  ARRAY['core'],
  'workout',
  'Coach Emma',
  ARRAY['core', 'abs', 'bodyweight', 'advanced']
),
(
  'Deadlift Safety and Progression',
  'Build a strong posterior chain safely with proper deadlift mechanics',
  'https://youtube.com/watch?v=example5',
  'https://img.youtube.com/vi/example5/mqdefault.jpg',
  600,
  'intermediate',
  ARRAY['barbell'],
  ARRAY['back', 'legs'],
  'tutorial',
  'Coach David',
  ARRAY['strength', 'powerlifting', 'back', 'legs']
),
(
  '30-Day Beginner Program Overview',
  'Complete guide to starting your fitness journey',
  'https://youtube.com/watch?v=example6',
  'https://img.youtube.com/vi/example6/mqdefault.jpg',
  1800,
  'beginner',
  ARRAY['dumbbells', 'resistance_band'],
  ARRAY['chest', 'back', 'legs', 'arms', 'shoulders', 'core'],
  'motivation',
  'Coach Mike',
  ARRAY['beginner', 'program', 'full-body']
);

-- Row Level Security
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view non-premium videos" ON exercise_videos
  FOR SELECT USING (is_premium = false OR created_by = auth.uid());

CREATE POLICY "Users can view their own playlists" ON video_playlists
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create playlists" ON video_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own video history" ON video_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record video views" ON video_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can like videos" ON video_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON video_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can post comments" ON video_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments" ON video_comments
  FOR UPDATE USING (auth.uid() = user_id);
