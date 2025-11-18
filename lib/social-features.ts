/**
 * Social Features Library
 * Friends system, activity feed, challenges, and leaderboards
 */

import { createClient } from '@/lib/supabase/server';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile?: {
    username: string;
    avatar_url?: string;
    bio?: string;
  };
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: 'workout' | 'meal' | 'achievement' | 'progress' | 'challenge';
  title: string;
  description: string;
  metadata?: any;
  created_at: string;
  user_profile?: {
    username: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'steps' | 'workouts' | 'weight_loss' | 'calories' | 'custom';
  goal: number;
  start_date: string;
  end_date: string;
  participants_count: number;
  is_public: boolean;
  created_by: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  completed: boolean;
  rank?: number;
  joined_at: string;
}

// Friends Management
export class FriendsService {
  async sendFriendRequest(userId: string, friendId: string): Promise<Friend> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acceptFriendRequest(requestId: string): Promise<Friend> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFriends(userId: string): Promise<Friend[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!friend_id(username, avatar_url, bio)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;
    return data || [];
  }

  async getPendingRequests(userId: string): Promise<Friend[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!user_id(username, avatar_url, bio)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }

  async removeFriend(friendshipId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
  }
}

// Activity Feed
export class ActivityFeedService {
  async createActivity(activity: Omit<ActivityFeedItem, 'id' | 'created_at' | 'likes_count' | 'comments_count'>): Promise<ActivityFeedItem> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('activity_feed')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFeed(userId: string, limit: number = 50): Promise<ActivityFeedItem[]> {
    const supabase = await createClient();

    // Get feed from user's friends
    const { data: friends } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    const friendIds = friends?.map(f => f.friend_id) || [];
    friendIds.push(userId); // Include user's own activities

    const { data, error } = await supabase
      .from('activity_feed')
      .select(`
        *,
        user_profile:profiles(username, avatar_url),
        likes:activity_likes(count),
        comments:activity_comments(count)
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async likeActivity(userId: string, activityId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('activity_likes')
      .insert({ user_id: userId, activity_id: activityId });

    if (error) throw error;
  }

  async commentOnActivity(userId: string, activityId: string, comment: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('activity_comments')
      .insert({ user_id: userId, activity_id: activityId, comment });

    if (error) throw error;
  }
}

// Challenges
export class ChallengesService {
  async createChallenge(challenge: Omit<Challenge, 'id' | 'participants_count'>): Promise<Challenge> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChallenges(isPublic: boolean = true): Promise<Challenge[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_public', isPublic)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async joinChallenge(userId: string, challengeId: string): Promise<ChallengeParticipant> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenge_participants')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        current_progress: 0,
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProgress(participantId: string, progress: number): Promise<ChallengeParticipant> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenge_participants')
      .update({ current_progress: progress })
      .eq('id', participantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .eq('challenge_id', challengeId)
      .order('current_progress', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Add ranks
    return (data || []).map((participant, index) => ({
      ...participant,
      rank: index + 1,
    }));
  }

  async getUserChallenges(userId: string): Promise<Array<Challenge & { participant: ChallengeParticipant }>> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        challenge:challenges(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      ...p.challenge,
      participant: p,
    }));
  }
}

// Export service instances
export const friendsService = new FriendsService();
export const activityFeedService = new ActivityFeedService();
export const challengesService = new ChallengesService();
