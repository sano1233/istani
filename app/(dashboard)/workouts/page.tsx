'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { motion } from 'framer-motion';

export default function WorkoutsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
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

        {/* Enhanced Quick Stats with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon="calendar_today"
            label="This Week"
            value="0 workouts"
            trend={{ value: '+0', direction: 'neutral' }}
            delay={0}
          />

          <StatCard
            icon="trending_up"
            label="Current Streak"
            value="0 days"
            delay={0.1}
          />

          <StatCard
            icon="fitness_center"
            label="Total Workouts"
            value="0"
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
