'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { motion } from 'framer-motion';

export default function ProgressPage() {
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

        {/* Stats Overview with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="trending_down"
            label="Weight Change"
            value="-- kg"
            trend={{ value: '2.5kg', direction: 'down' }}
            delay={0}
          />

          <StatCard
            icon="show_chart"
            label="Body Fat %"
            value="-- %"
            trend={{ value: '1.2%', direction: 'down' }}
            delay={0.1}
          />

          <StatCard
            icon="calendar_month"
            label="Days Tracked"
            value="0"
            delay={0.2}
          />

          <StatCard
            icon="workspace_premium"
            label="Achievements"
            value="0"
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
