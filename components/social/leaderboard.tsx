'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';

interface LeaderboardEntry {
  id: string;
  rank: number;
  user_id: string;
  score: number;
  previous_rank: number | null;
  rank_change: number | null;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface LeaderboardProps {
  type?: 'global' | 'weekly' | 'monthly' | 'friends';
  metric?: 'total_workouts' | 'total_calories' | 'streak_days' | 'points';
  limit?: number;
}

export function Leaderboard({ type = 'global', metric = 'points', limit = 10 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadLeaderboard();
  }, [type, metric]);

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get leaderboard
      const { data: leaderboardData } = await supabase
        .from('leaderboards')
        .select('id')
        .eq('leaderboard_type', type)
        .eq('metric_type', metric)
        .single();

      if (leaderboardData) {
        const { data: entriesData } = await supabase
          .from('leaderboard_entries')
          .select(
            `
            *,
            users:user_id (
              full_name,
              avatar_url
            )
          `,
          )
          .eq('leaderboard_id', leaderboardData.id)
          .order('rank', { ascending: true })
          .limit(limit);

        if (entriesData) {
          setEntries(
            entriesData.map((e: any) => ({
              ...e,
              user: e.users,
            })),
          );

          // Find current user's rank
          if (user) {
            const userEntry = entriesData.find((e: any) => e.user_id === user.id);
            if (userEntry) {
              setCurrentUserRank(userEntry.rank);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankChangeIcon = (change: number | null) => {
    if (!change) return null;
    if (change > 0) return <span className="text-green-500">↑{change}</span>;
    if (change < 0) return <span className="text-red-500">↓{Math.abs(change)}</span>;
    return <span className="text-gray-500">→</span>;
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'total_workouts':
        return 'Workouts';
      case 'total_calories':
        return 'Calories Burned';
      case 'streak_days':
        return 'Day Streak';
      case 'points':
        return 'Points';
      default:
        return 'Score';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          <p className="text-white/60 text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)} - {getMetricLabel(metric)}
          </p>
        </div>
        {currentUserRank && (
          <div className="text-right">
            <p className="text-white/60 text-sm">Your Rank</p>
            <p className="text-2xl font-bold text-primary">#{currentUserRank}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-white/60 text-center py-8">
            No leaderboard data available yet. Start working out to compete!
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 text-center">
                <span className="text-2xl font-bold">{getRankIcon(entry.rank)}</span>
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {entry.user.avatar_url ? (
                  <img
                    src={entry.user.avatar_url}
                    alt={entry.user.full_name || 'User'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {entry.user.full_name || 'Anonymous User'}
                </p>
                <p className="text-white/60 text-sm">{getRankChangeIcon(entry.rank_change)}</p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  {metric === 'total_calories'
                    ? `${entry.score.toLocaleString()} cal`
                    : metric === 'streak_days'
                      ? `${entry.score} days`
                      : metric === 'points'
                        ? `${entry.score.toLocaleString()} pts`
                        : entry.score.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {entries.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">Updated in real-time</p>
        </div>
      )}
    </Card>
  );
}
