import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Leaderboard } from '@/components/social/leaderboard';
import { ChallengesList } from '@/components/social/challenges-list';
import { ActivityFeed } from '@/components/social/activity-feed';
import { AchievementsDisplay } from '@/components/social/achievements-display';
import { Card } from '@/components/ui/card';

/**
 * Render the Social Hub page for the authenticated user.
 *
 * Ensures the user is authenticated (redirects to `/login` if not), fetches the current
 * user's points, friend count, and active challenge count, and returns the page UI
 * composed of stats cards, leaderboard, achievements, activity feed, and active challenges.
 *
 * @returns The Social Hub page JSX populated with the current user's social stats and related components.
 */
export default async function SocialPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's social stats
  const { data: userPoints } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { count: connectionsCount = 0 } = await supabase
    .from('user_connections')
    .select('id', { count: 'exact', head: true })
    .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
    .eq('status', 'accepted');

  const { count: activeChallengesCount = 0 } = await supabase
    .from('challenge_participants')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Social Hub</h1>
          <p className="text-white/60">Connect, compete, and conquer together</p>
        </div>

        {/* User Social Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  workspace_premium
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Level</p>
                <p className="text-2xl font-bold text-white">{userPoints?.current_level || 1}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <span className="material-symbols-outlined text-yellow-500 text-3xl">stars</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Points</p>
                <p className="text-2xl font-bold text-white">
                  {userPoints?.total_points?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <span className="material-symbols-outlined text-blue-500 text-3xl">group</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Friends</p>
                <p className="text-2xl font-bold text-white">{connectionsCount}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <span className="material-symbols-outlined text-purple-500 text-3xl">flag</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Active Challenges</p>
                <p className="text-2xl font-bold text-white">{activeChallengesCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Leaderboard & Achievements */}
          <div className="space-y-8">
            <Leaderboard type="global" metric="points" limit={10} />

            <AchievementsDisplay userId={user.id} compact />
          </div>

          {/* Middle Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Activity Feed</h2>
              <ActivityFeed limit={15} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Active Challenges</h2>
              <ChallengesList />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}