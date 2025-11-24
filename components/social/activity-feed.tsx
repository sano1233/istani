'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  activity_data: any;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
  user_has_liked?: boolean;
}

interface ActivityFeedProps {
  userId?: string; // If provided, show only this user's activities
  limit?: number;
}

export function ActivityFeed({ userId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadActivities();
  }, [userId]);

  async function loadActivities() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      let query = supabase
        .from('activity_feed')
        .select(
          `
          *,
          users:user_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: activitiesData } = await query;

      if (activitiesData && user) {
        // Check which activities the current user has liked
        const activityIds = activitiesData.map((a: any) => a.id);
        const { data: likesData } = await supabase
          .from('activity_likes')
          .select('activity_id')
          .eq('user_id', user.id)
          .in('activity_id', activityIds);

        const likedIds = new Set(likesData?.map((l: any) => l.activity_id) || []);

        setActivities(
          activitiesData.map((a: any) => ({
            ...a,
            user: a.users,
            user_has_liked: likedIds.has(a.id),
          })),
        );
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(activityId: string) {
    if (!currentUserId) return;

    try {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      if (activity.user_has_liked) {
        // Unlike
        await supabase
          .from('activity_likes')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', currentUserId);

        // Update UI
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  likes_count: Math.max(0, a.likes_count - 1),
                  user_has_liked: false,
                }
              : a,
          ),
        );
      } else {
        // Like
        await supabase.from('activity_likes').insert({
          activity_id: activityId,
          user_id: currentUserId,
        });

        // Update UI
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  likes_count: a.likes_count + 1,
                  user_has_liked: true,
                }
              : a,
          ),
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return 'fitness_center';
      case 'achievement':
        return 'emoji_events';
      case 'challenge':
        return 'flag';
      case 'milestone':
        return 'star';
      case 'post':
        return 'chat_bubble';
      default:
        return 'notifications';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'text-blue-500';
      case 'achievement':
        return 'text-yellow-500';
      case 'challenge':
        return 'text-purple-500';
      case 'milestone':
        return 'text-green-500';
      case 'post':
        return 'text-pink-500';
      default:
        return 'text-white';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              activity_zone
            </span>
            <h3 className="text-xl font-bold text-white mb-2">No activity yet</h3>
            <p className="text-white/60">
              Complete workouts, earn achievements, and participate in challenges to see activity
              here!
            </p>
          </div>
        </Card>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id} className="p-6 hover:bg-white/5 transition-colors">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {activity.user.avatar_url ? (
                  <img
                    src={activity.user.avatar_url}
                    alt={activity.user.full_name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">
                    {activity.user.full_name || 'Anonymous'}
                  </p>
                  <span
                    className={`material-symbols-outlined text-sm ${getActivityColor(activity.activity_type)}`}
                  >
                    {getActivityIcon(activity.activity_type)}
                  </span>
                </div>
                <p className="text-white/60 text-sm">{getTimeAgo(activity.created_at)}</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2">{activity.title}</h4>
              {activity.description && <p className="text-white/80">{activity.description}</p>}

              {/* Activity Data (workout stats, etc.) */}
              {activity.activity_data && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {Object.entries(activity.activity_data).map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/60 text-xs capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-white font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <button
                onClick={() => toggleLike(activity.id)}
                className={`flex items-center gap-2 transition-colors ${
                  activity.user_has_liked ? 'text-red-500' : 'text-white/60 hover:text-red-500'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {activity.user_has_liked ? 'favorite' : 'favorite_border'}
                </span>
                <span className="font-semibold">{activity.likes_count}</span>
              </button>

              <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">chat_bubble_outline</span>
                <span className="font-semibold">{activity.comments_count}</span>
              </button>

              <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors ml-auto">
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
            </div>
          </Card>
        ))
      )}

      {activities.length >= limit && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={loadActivities}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
