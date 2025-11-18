-- Social Features Extension for ISTANI
-- Leaderboards, Friends, Challenges, and Community Features

-- Friends/Following System
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON user_connections(following_id);
CREATE INDEX idx_user_connections_status ON user_connections(status);

-- Community Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'workout_count', 'total_calories', 'consistency', 'distance', 'weight_loss'
  goal_value INTEGER NOT NULL, -- target value to achieve
  goal_unit TEXT, -- 'workouts', 'calories', 'days', 'km', 'kg'
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'extreme'
  duration_days INTEGER DEFAULT 30,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reward_points INTEGER DEFAULT 100,
  reward_badge TEXT,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  entry_fee_points INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_challenges_active ON challenges(is_active, start_date, end_date);
CREATE INDEX idx_challenges_type ON challenges(challenge_type);

-- Challenge Participants
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_progress NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed', 'withdrawn'
  completed_at TIMESTAMP WITH TIME ZONE,
  rank INTEGER,
  points_earned INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_rank ON challenge_participants(challenge_id, rank);

-- Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_type TEXT NOT NULL, -- 'global', 'weekly', 'monthly', 'friends', 'challenge'
  metric_type TEXT NOT NULL, -- 'total_workouts', 'total_calories', 'streak_days', 'points'
  time_period TEXT DEFAULT 'all_time', -- 'all_time', 'monthly', 'weekly', 'daily'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score NUMERIC(10,2) NOT NULL,
  previous_rank INTEGER,
  rank_change INTEGER, -- positive for up, negative for down
  metadata JSONB, -- additional stats
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(leaderboard_id, user_id)
);

CREATE INDEX idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(leaderboard_id, rank);
CREATE INDEX idx_leaderboard_entries_user ON leaderboard_entries(user_id);

-- Points System
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  points_to_next_level INTEGER DEFAULT 100,
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_points_total ON user_points(total_points DESC);

-- Point Transactions
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- positive for earned, negative for spent
  transaction_type TEXT NOT NULL, -- 'workout_complete', 'challenge_win', 'streak_bonus', 'purchase', 'gift'
  description TEXT,
  reference_id UUID, -- reference to workout, challenge, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type);

-- Achievements/Badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  badge_icon TEXT, -- emoji or icon name
  badge_color TEXT DEFAULT '#FFD700',
  achievement_type TEXT NOT NULL, -- 'workout', 'nutrition', 'streak', 'social', 'challenge'
  requirement_type TEXT NOT NULL, -- 'count', 'streak', 'single', 'cumulative'
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 50,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- User Achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress NUMERIC(10,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);

-- Activity Feed (Social Feed)
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'workout', 'achievement', 'challenge', 'milestone', 'post'
  title TEXT NOT NULL,
  description TEXT,
  activity_data JSONB, -- workout details, achievement info, etc.
  visibility TEXT DEFAULT 'public', -- 'public', 'friends', 'private'
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_type ON activity_feed(activity_type);
CREATE INDEX idx_activity_feed_visibility ON activity_feed(visibility, created_at DESC);

-- Activity Likes
CREATE TABLE activity_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE INDEX idx_activity_likes_activity ON activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user ON activity_likes(user_id);

-- Activity Comments
CREATE TABLE activity_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES activity_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_comments_activity ON activity_comments(activity_id, created_at);
CREATE INDEX idx_activity_comments_user ON activity_comments(user_id);

-- User Profiles Extension
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public'; -- 'public', 'friends', 'private'
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB; -- {instagram, twitter, youtube}
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_coach BOOLEAN DEFAULT false;

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'friend_request', 'challenge_invite', 'achievement', 'like', 'comment', 'milestone'
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Insert default achievements
INSERT INTO achievements (name, description, badge_icon, achievement_type, requirement_type, requirement_value, points_reward, rarity) VALUES
('First Workout', 'Complete your first workout', '💪', 'workout', 'count', 1, 10, 'common'),
('Week Warrior', 'Complete 7 workouts', '🔥', 'workout', 'count', 7, 50, 'common'),
('Century Club', 'Complete 100 workouts', '💯', 'workout', 'count', 100, 500, 'rare'),
('Marathon Master', 'Complete 500 workouts', '🏆', 'workout', 'count', 500, 2000, 'epic'),
('7 Day Streak', 'Maintain a 7-day workout streak', '⚡', 'streak', 'streak', 7, 100, 'common'),
('30 Day Streak', 'Maintain a 30-day workout streak', '🌟', 'streak', 'streak', 30, 300, 'rare'),
('Iron Will', 'Maintain a 100-day workout streak', '💎', 'streak', 'streak', 100, 1000, 'epic'),
('Nutrition Ninja', 'Log 30 meals', '🥗', 'nutrition', 'count', 30, 100, 'common'),
('Social Butterfly', 'Make 10 friends', '🦋', 'social', 'count', 10, 50, 'common'),
('Challenge Champion', 'Win your first challenge', '👑', 'challenge', 'count', 1, 200, 'rare'),
('Legend', 'Reach level 50', '⭐', 'streak', 'cumulative', 50, 5000, 'legendary');

-- Function to update user points
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_current_points INTEGER;
  v_current_level INTEGER;
  v_points_to_next INTEGER;
BEGIN
  -- Insert into user_points if doesn't exist
  INSERT INTO user_points (user_id, total_points, current_level, points_to_next_level, lifetime_points)
  VALUES (p_user_id, 0, 1, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Record transaction
  INSERT INTO point_transactions (user_id, points, transaction_type, description, reference_id)
  VALUES (p_user_id, p_points, p_transaction_type, p_description, p_reference_id);

  -- Update points
  UPDATE user_points
  SET
    total_points = total_points + p_points,
    lifetime_points = lifetime_points + GREATEST(p_points, 0),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING total_points, current_level, points_to_next_level INTO v_current_points, v_current_level, v_points_to_next;

  -- Level up logic
  WHILE v_current_points >= v_points_to_next LOOP
    v_current_level := v_current_level + 1;
    v_current_points := v_current_points - v_points_to_next;
    v_points_to_next := v_points_to_next + (v_current_level * 10); -- Progressive difficulty

    UPDATE user_points
    SET
      current_level = v_current_level,
      points_to_next_level = v_points_to_next,
      total_points = v_current_points
    WHERE user_id = p_user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievement(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_current_value INTEGER
)
RETURNS void AS $$
DECLARE
  v_achievement RECORD;
BEGIN
  FOR v_achievement IN
    SELECT a.* FROM achievements a
    WHERE a.achievement_type = p_achievement_type
    AND a.requirement_value <= p_current_value
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      WHERE ua.user_id = p_user_id
      AND ua.achievement_id = a.id
      AND ua.is_completed = true
    )
  LOOP
    -- Award achievement
    INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at, unlocked_at)
    VALUES (p_user_id, v_achievement.id, v_achievement.requirement_value, true, NOW(), NOW())
    ON CONFLICT (user_id, achievement_id) DO UPDATE
    SET
      is_completed = true,
      completed_at = NOW(),
      unlocked_at = NOW(),
      progress = v_achievement.requirement_value;

    -- Award points
    PERFORM update_user_points(
      p_user_id,
      v_achievement.points_reward,
      'achievement',
      'Unlocked: ' || v_achievement.name,
      v_achievement.id
    );

    -- Create notification
    INSERT INTO notifications (user_id, notification_type, title, message, reference_id)
    VALUES (
      p_user_id,
      'achievement',
      'Achievement Unlocked!',
      'You earned: ' || v_achievement.name || ' (+' || v_achievement.points_reward || ' points)',
      v_achievement.id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own connections" ON user_connections
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create connections" ON user_connections
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can view active challenges" ON challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view public activity feed" ON activity_feed
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
