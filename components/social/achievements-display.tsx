'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  badge_icon: string | null;
  badge_color: string;
  achievement_type: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  rarity: string;
  is_secret: boolean;
  user_achievement?: {
    progress: number;
    is_completed: boolean;
    completed_at: string | null;
  };
}

interface AchievementsDisplayProps {
  userId?: string;
  compact?: boolean;
}

export function AchievementsDisplay({ userId, compact = false }: AchievementsDisplayProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    points_earned: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    loadAchievements();
  }, [userId, filter]);

  async function loadAchievements() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return;

      // Load all achievements with user progress
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select(
          `
          *,
          user_achievements!left (
            progress,
            is_completed,
            completed_at
          )
        `,
        )
        .eq('user_achievements.user_id', targetUserId)
        .order('rarity', { ascending: true })
        .order('points_reward', { ascending: false });

      if (achievementsData) {
        let filteredAchievements = achievementsData.map((a: any) => ({
          ...a,
          user_achievement: a.user_achievements?.[0] || null,
        }));

        // Apply filter
        if (filter === 'completed') {
          filteredAchievements = filteredAchievements.filter(
            (a: any) => a.user_achievement?.is_completed,
          );
        } else if (filter === 'in-progress') {
          filteredAchievements = filteredAchievements.filter(
            (a: any) => a.user_achievement && !a.user_achievement.is_completed,
          );
        }

        setAchievements(filteredAchievements);

        // Calculate stats
        const completed = achievementsData.filter(
          (a: any) => a.user_achievements?.[0]?.is_completed,
        ).length;
        const pointsEarned = achievementsData
          .filter((a: any) => a.user_achievements?.[0]?.is_completed)
          .reduce((sum: number, a: any) => sum + a.points_reward, 0);

        setStats({
          total: achievementsData.length,
          completed,
          points_earned: pointsEarned,
        });
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500';
      case 'rare':
        return 'border-blue-500';
      case 'epic':
        return 'border-purple-500';
      case 'legendary':
        return 'border-yellow-500';
      default:
        return 'border-white/20';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-[0_0_20px_rgba(234,179,8,0.5)]';
      case 'epic':
        return 'shadow-[0_0_15px_rgba(168,85,247,0.4)]';
      case 'rare':
        return 'shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Achievements</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {stats.completed}/{stats.total}
            </p>
            <p className="text-white/60 text-sm">{stats.points_earned} points</p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {achievements
            .filter((a) => a.user_achievement?.is_completed)
            .slice(0, 5)
            .map((achievement) => (
              <div
                key={achievement.id}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)} bg-white/5 flex items-center justify-center`}
                title={achievement.name}
              >
                <span className="text-4xl">{achievement.badge_icon || '🏆'}</span>
              </div>
            ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-white">{stats.completed}</p>
          <p className="text-white/60 text-sm">Unlocked</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-white">{stats.total - stats.completed}</p>
          <p className="text-white/60 text-sm">Remaining</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{stats.points_earned}</p>
          <p className="text-white/60 text-sm">Points Earned</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['all', 'completed', 'in-progress'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === f
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
                  emoji_events
                </span>
                <h3 className="text-xl font-bold text-white mb-2">No achievements yet</h3>
                <p className="text-white/60">Start completing workouts to unlock achievements!</p>
              </div>
            </Card>
          </div>
        ) : (
          achievements.map((achievement) => {
            const isCompleted = achievement.user_achievement?.is_completed;
            const progress = achievement.user_achievement?.progress || 0;
            const progressPercent = (progress / achievement.requirement_value) * 100;

            return (
              <Card
                key={achievement.id}
                className={`p-4 hover:bg-white/5 transition-all ${
                  isCompleted ? getRarityGlow(achievement.rarity) : 'opacity-60'
                }`}
              >
                {/* Badge */}
                <div
                  className={`aspect-square rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${
                    isCompleted ? 'bg-white/10' : 'bg-white/5'
                  } flex items-center justify-center mb-3 relative`}
                >
                  {achievement.is_secret && !isCompleted ? (
                    <span className="material-symbols-outlined text-6xl text-white/20">lock</span>
                  ) : (
                    <span className="text-6xl">{achievement.badge_icon || '🏆'}</span>
                  )}

                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h4 className="text-white font-semibold mb-1 truncate">{achievement.name}</h4>
                  {achievement.description && !achievement.is_secret && (
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">
                      {achievement.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  {!isCompleted && achievement.user_achievement && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white/60 text-xs">Progress</p>
                        <p className="text-white text-xs font-semibold">
                          {Math.floor(progressPercent)}%
                        </p>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        {Math.floor(progress)} / {achievement.requirement_value}
                      </p>
                    </div>
                  )}

                  {/* Reward */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded capitalize ${
                        achievement.rarity === 'legendary'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : achievement.rarity === 'epic'
                            ? 'bg-purple-500/20 text-purple-500'
                            : achievement.rarity === 'rare'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {achievement.rarity}
                    </span>
                    <span className="text-xs text-primary font-semibold">
                      +{achievement.points_reward} pts
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
