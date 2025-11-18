'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  goal_value: number;
  goal_unit: string;
  difficulty: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  reward_points: number;
  reward_badge: string | null;
  max_participants: number | null;
  participants_count?: number;
  user_participation?: {
    current_progress: number;
    status: string;
  };
}

export function ChallengesList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'completed'>('active');
  const supabase = createClient();

  useEffect(() => {
    loadChallenges();
  }, [filter]);

  async function loadChallenges() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const today = new Date().toISOString().split('T')[0];

      let query = supabase.from('challenges').select(
        `
          *,
          participants:challenge_participants(count)
        `
      );

      // Filter based on status
      if (filter === 'active') {
        query = query.lte('start_date', today).gte('end_date', today).eq('is_active', true);
      } else if (filter === 'upcoming') {
        query = query.gt('start_date', today).eq('is_active', true);
      } else if (filter === 'completed') {
        query = query.lt('end_date', today);
      }

      const { data: challengesData } = await query.order('start_date', { ascending: false });

      if (challengesData && user) {
        // Get user's participation for each challenge
        const challengeIds = challengesData.map((c: any) => c.id);
        const { data: participationData } = await supabase
          .from('challenge_participants')
          .select('challenge_id, current_progress, status')
          .eq('user_id', user.id)
          .in('challenge_id', challengeIds);

        const participationMap = new Map(
          participationData?.map((p) => [
            p.challenge_id,
            { current_progress: p.current_progress, status: p.status },
          ])
        );

        setChallenges(
          challengesData.map((c: any) => ({
            ...c,
            participants_count: c.participants?.[0]?.count || 0,
            user_participation: participationMap.get(c.id),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function joinChallenge(challengeId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: user.id,
        current_progress: 0,
        status: 'active',
      });

      if (error) throw error;

      // Reload challenges to update UI
      await loadChallenges();
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      alert(error.message || 'Failed to join challenge');
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'hard':
        return 'text-orange-500';
      case 'extreme':
        return 'text-red-500';
      default:
        return 'text-white';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/10 rounded w-2/3"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['active', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === f
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {challenges.length === 0 ? (
          <div className="col-span-2">
            <Card className="p-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
                  emoji_events
                </span>
                <h3 className="text-xl font-bold text-white mb-2">No challenges available</h3>
                <p className="text-white/60">
                  Check back later for new challenges or create your own!
                </p>
              </div>
            </Card>
          </div>
        ) : (
          challenges.map((challenge) => (
            <Card key={challenge.id} className="p-6 hover:bg-white/5 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{challenge.title}</h3>
                  <p className="text-white/60 text-sm">{challenge.description}</p>
                </div>
                {challenge.reward_badge && (
                  <span className="text-4xl ml-4">{challenge.reward_badge}</span>
                )}
              </div>

              {/* Challenge Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white/60 text-sm">Goal</p>
                  <p className="text-white font-semibold">
                    {challenge.goal_value} {challenge.goal_unit}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Difficulty</p>
                  <p className={`font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Reward</p>
                  <p className="text-white font-semibold">{challenge.reward_points} points</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Duration</p>
                  <p className="text-white font-semibold">{challenge.duration_days} days</p>
                </div>
              </div>

              {/* Progress Bar (if user is participating) */}
              {challenge.user_participation && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60 text-sm">Your Progress</p>
                    <p className="text-white text-sm font-semibold">
                      {challenge.user_participation.current_progress} / {challenge.goal_value}
                    </p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((challenge.user_participation.current_progress / challenge.goal_value) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">group</span>
                    <span>{challenge.participants_count || 0} participants</span>
                  </div>
                  {filter === 'active' && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span>{getDaysRemaining(challenge.end_date)} days left</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {!challenge.user_participation ? (
                  <Button onClick={() => joinChallenge(challenge.id)} size="sm">
                    Join Challenge
                  </Button>
                ) : challenge.user_participation.status === 'active' ? (
                  <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold">
                    Participating
                  </span>
                ) : challenge.user_participation.status === 'completed' ? (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg text-sm font-semibold">
                    ✓ Completed
                  </span>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
