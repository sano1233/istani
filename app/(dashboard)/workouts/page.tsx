'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { motion } from 'framer-motion';

interface WorkoutStats {
  thisWeek: number;
  lastWeek: number;
  currentStreak: number;
  totalWorkouts: number;
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<WorkoutStats>({
    thisWeek: 0,
    lastWeek: 0,
    currentStreak: 0,
    totalWorkouts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch all workouts ordered by completion date
      const { data: allWorkouts } = await supabase
        .from('workouts')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      const totalWorkouts = allWorkouts?.length || 0;

      // Calculate this week's workouts (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const thisWeek = allWorkouts?.filter((w) => new Date(w.completed_at) >= sevenDaysAgo).length || 0;

      // Calculate last week's workouts (8-14 days ago)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const lastWeek =
        allWorkouts?.filter((w) => {
          const date = new Date(w.completed_at);
          return date >= fourteenDaysAgo && date < sevenDaysAgo;
        }).length || 0;

      // Calculate current streak (consecutive days with workouts)
      let currentStreak = 0;
      if (allWorkouts && allWorkouts.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Group workouts by date
        const workoutDates = new Set(
          allWorkouts.map((w) => {
            const date = new Date(w.completed_at);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          })
        );

        // Count consecutive days backwards from today
        let checkDate = new Date(today);
        while (workoutDates.has(checkDate.getTime())) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      setUser(user);
      setStats({
        thisWeek,
        lastWeek,
        currentStreak,
        totalWorkouts,
      });
      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white/10 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Workouts</h1>
            <p className="text-white/60">Track your training and stay consistent</p>
          </div>
          <Button className="gap-2">
            <span className="material-symbols-outlined">add</span>
            New Workout
          </Button>
        </motion.div>

        {/* Enhanced Quick Stats with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon="calendar_today"
            label="This Week"
            value={`${stats.thisWeek} workout${stats.thisWeek !== 1 ? 's' : ''}`}
            trend={
              stats.lastWeek > 0
                ? {
                    value: `${Math.abs(stats.thisWeek - stats.lastWeek)}`,
                    direction: stats.thisWeek > stats.lastWeek ? 'up' : stats.thisWeek < stats.lastWeek ? 'down' : 'neutral',
                  }
                : undefined
            }
            delay={0}
          />

          <StatCard
            icon="trending_up"
            label="Current Streak"
            value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`}
            delay={0.1}
          />

          <StatCard
            icon="fitness_center"
            label="Total Workouts"
            value={stats.totalWorkouts}
            delay={0.2}
          />
        </div>

        {/* Enhanced Empty State with Motivation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <EmptyState
            icon="fitness_center"
            title="Start Your Fitness Journey"
            description="Log your first workout and begin building the healthy, strong body you deserve. Every champion was once a beginner!"
            primaryAction={{
              label: 'Log Your First Workout',
              onClick: () => {},
              icon: 'add',
            }}
            secondaryAction={{
              label: 'Browse Workout Templates',
              onClick: () => {},
              icon: 'library_books',
            }}
          />
        </motion.div>
      </div>
    </main>
  );
}
