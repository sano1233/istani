'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { motion } from 'framer-motion';

interface ProgressStats {
  weightChange: number | null;
  weightDirection: 'up' | 'down' | 'neutral';
  bodyFatChange: number | null;
  bodyFatDirection: 'up' | 'down' | 'neutral';
  daysTracked: number;
  achievements: number;
}

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<ProgressStats>({
    weightChange: null,
    weightDirection: 'neutral',
    bodyFatChange: null,
    bodyFatDirection: 'neutral',
    daysTracked: 0,
    achievements: 0,
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

      // Fetch all body measurements ordered by date
      const { data: measurements } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: true });

      const daysTracked = measurements?.length || 0;

      // Calculate weight change (first vs latest)
      let weightChange: number | null = null;
      let weightDirection: 'up' | 'down' | 'neutral' = 'neutral';

      if (measurements && measurements.length >= 2) {
        const firstWeight = measurements[0].weight_kg;
        const latestWeight = measurements[measurements.length - 1].weight_kg;
        weightChange = latestWeight - firstWeight;
        weightDirection = weightChange < 0 ? 'down' : weightChange > 0 ? 'up' : 'neutral';
      }

      // Calculate body fat change (first vs latest)
      let bodyFatChange: number | null = null;
      let bodyFatDirection: 'up' | 'down' | 'neutral' = 'neutral';

      const measurementsWithBodyFat = measurements?.filter(m => m.body_fat_percentage != null);
      if (measurementsWithBodyFat && measurementsWithBodyFat.length >= 2) {
        const firstBodyFat = measurementsWithBodyFat[0].body_fat_percentage!;
        const latestBodyFat = measurementsWithBodyFat[measurementsWithBodyFat.length - 1].body_fat_percentage!;
        bodyFatChange = latestBodyFat - firstBodyFat;
        bodyFatDirection = bodyFatChange < 0 ? 'down' : bodyFatChange > 0 ? 'up' : 'neutral';
      }

      // Calculate achievements (simple milestones for now)
      let achievements = 0;
      if (daysTracked >= 1) achievements++; // First measurement
      if (daysTracked >= 7) achievements++; // Week of tracking
      if (daysTracked >= 30) achievements++; // Month of tracking
      if (weightChange && weightChange < 0) achievements++; // Weight loss
      if (bodyFatChange && bodyFatChange < 0) achievements++; // Body fat reduction

      setUser(user);
      setStats({
        weightChange,
        weightDirection,
        bodyFatChange,
        bodyFatDirection,
        daysTracked,
        achievements,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
            <h1 className="text-4xl font-black text-white mb-2">Progress</h1>
            <p className="text-white/60">Track your fitness journey and achievements</p>
          </div>
          <Button className="gap-2">
            <span className="material-symbols-outlined">add</span>
            Add Entry
          </Button>
        </motion.div>

        {/* Stats Overview with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="trending_down"
            label="Weight Change"
            value={
              stats.weightChange !== null
                ? `${stats.weightChange >= 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg`
                : 'N/A'
            }
            trend={
              stats.weightChange !== null
                ? {
                    value: `${Math.abs(stats.weightChange).toFixed(1)}kg`,
                    direction: stats.weightDirection,
                  }
                : undefined
            }
            delay={0}
          />

          <StatCard
            icon="show_chart"
            label="Body Fat Change"
            value={
              stats.bodyFatChange !== null
                ? `${stats.bodyFatChange >= 0 ? '+' : ''}${stats.bodyFatChange.toFixed(1)}%`
                : 'N/A'
            }
            trend={
              stats.bodyFatChange !== null
                ? {
                    value: `${Math.abs(stats.bodyFatChange).toFixed(1)}%`,
                    direction: stats.bodyFatDirection,
                  }
                : undefined
            }
            delay={0.1}
          />

          <StatCard
            icon="calendar_month"
            label="Days Tracked"
            value={stats.daysTracked}
            delay={0.2}
          />

          <StatCard
            icon="workspace_premium"
            label="Achievements"
            value={stats.achievements}
            delay={0.3}
          />
        </div>

        {/* Progress Chart with Enhanced Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Weight Progress</h2>
            <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-white/5">
              <EmptyState
                icon="insert_chart"
                title="Start Tracking Your Progress"
                description="Add your first weight entry to see beautiful progress charts and insights"
                primaryAction={{
                  label: 'Add Weight Entry',
                  onClick: () => {},
                  icon: 'add',
                }}
                secondaryAction={{
                  label: 'Learn More',
                  onClick: () => {},
                  icon: 'info',
                }}
                className="border-0 bg-transparent"
              />
            </div>
          </Card>
        </motion.div>

        {/* Recent Entries with Enhanced Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Entries</h2>
            <EmptyState
              icon="history"
              title="No Progress Entries Yet"
              description="Start your fitness journey today! Track your measurements, weight, and body composition to see amazing transformations over time."
              primaryAction={{
                label: 'Add First Entry',
                onClick: () => {},
                icon: 'add',
              }}
              secondaryAction={{
                label: 'View Guide',
                onClick: () => {},
                icon: 'menu_book',
              }}
              className="border-0"
            />
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
