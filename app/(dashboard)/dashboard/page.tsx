'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { calculateBMI, calculateBMR, calculateTDEE } from '@/lib/fitness-calculations';
import { motion } from 'framer-motion';

interface DashboardStats {
  currentWeight: number | null;
  weightTrend: { value: string; direction: 'up' | 'down' | 'neutral' } | undefined;
  bmi: number | null;
  bmiTrend: { value: string; direction: 'up' | 'down' | 'neutral' } | undefined;
  tdee: number | null;
  bodyFat: number | null;
  bodyFatTrend: { value: string; direction: 'up' | 'down' | 'neutral' } | undefined;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    currentWeight: null,
    weightTrend: undefined,
    bmi: null,
    bmiTrend: undefined,
    tdee: null,
    bodyFat: null,
    bodyFatTrend: undefined,
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

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      // Fetch latest body measurement
      const { data: latestMeasurement } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch measurement from 30 days ago for trend calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: oldMeasurement } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .lte('measured_at', thirtyDaysAgo.toISOString())
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Calculate current weight (prefer latest measurement over profile)
      const currentWeight = latestMeasurement?.weight_kg ?? profile?.current_weight_kg ?? null;
      const oldWeight = oldMeasurement?.weight_kg;

      // Calculate weight trend
      const weightTrend =
        currentWeight && oldWeight
          ? {
              value: `${Math.abs(currentWeight - oldWeight).toFixed(1)}kg`,
              direction: (currentWeight < oldWeight ? 'down' : currentWeight > oldWeight ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
            }
          : undefined;

      // Calculate BMI
      const heightCm = profile?.height_cm;
      const currentBmi = currentWeight && heightCm ? calculateBMI(currentWeight, heightCm) : null;
      const oldBmi = oldWeight && heightCm ? calculateBMI(oldWeight, heightCm) : null;

      // Calculate BMI trend
      const bmiTrend =
        currentBmi && oldBmi
          ? {
              value: Math.abs(currentBmi - oldBmi).toFixed(1),
              direction: (currentBmi < oldBmi ? 'down' : currentBmi > oldBmi ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
            }
          : undefined;

      // Calculate TDEE
      const bmr =
        currentWeight && heightCm && profile?.age && profile?.gender
          ? calculateBMR(currentWeight, heightCm, profile.age, profile.gender)
          : null;
      const tdee = bmr && profile?.activity_level ? calculateTDEE(bmr, profile.activity_level) : null;

      // Body fat data
      const currentBodyFat = latestMeasurement?.body_fat_percentage ?? null;
      const oldBodyFat = oldMeasurement?.body_fat_percentage;

      // Calculate body fat trend
      const bodyFatTrend =
        currentBodyFat && oldBodyFat
          ? {
              value: `${Math.abs(currentBodyFat - oldBodyFat).toFixed(1)}%`,
              direction: (currentBodyFat < oldBodyFat ? 'down' : currentBodyFat > oldBodyFat ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
            }
          : undefined;

      setUser(user);
      setProfile(profile);
      setStats({
        currentWeight,
        weightTrend,
        bmi: currentBmi,
        bmiTrend,
        tdee,
        bodyFat: currentBodyFat,
        bodyFatTrend,
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
            <div className="h-12 bg-white/10 rounded w-1/4 mb-8" />
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
        <motion.h1
          className="text-4xl font-black text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard
        </motion.h1>

        {/* Enhanced Stats Grid with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="scale"
            label="Current Weight"
            value={stats.currentWeight ? `${stats.currentWeight} kg` : 'N/A'}
            trend={stats.weightTrend}
            delay={0}
          />

          <StatCard
            icon="monitoring"
            label="BMI"
            value={stats.bmi ? stats.bmi.toFixed(1) : 'N/A'}
            trend={stats.bmiTrend}
            delay={0.1}
          />

          <StatCard
            icon="local_fire_department"
            label="Daily Calories"
            value={stats.tdee ? `${stats.tdee}` : 'N/A'}
            delay={0.2}
          />

          <StatCard
            icon="fitness_center"
            label="Body Fat %"
            value={stats.bodyFat ? `${stats.bodyFat}%` : 'N/A'}
            trend={stats.bodyFatTrend}
            delay={0.3}
          />
        </div>

        {/* Quick Actions with Stagger Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="transition-all duration-300 hover:shadow-xl hover:border-primary/50">
              <h2 className="text-2xl font-bold text-white mb-4">Your Fitness Goals</h2>
              {profile?.primary_goal ? (
                <div className="space-y-3">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <p className="text-white">{profile.primary_goal}</p>
                  </motion.div>
                  {profile.target_weight_kg && (
                    <motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span className="material-symbols-outlined text-primary">flag</span>
                      <p className="text-white">Target Weight: {profile.target_weight_kg} kg</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon="flag"
                  title="Set Your Goals"
                  description="Define your fitness goals to get personalized workout and nutrition plans"
                  primaryAction={{
                    label: 'Set Goals',
                    onClick: () => router.push('/settings'),
                    icon: 'edit',
                  }}
                  className="border-0"
                />
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="transition-all duration-300 hover:shadow-xl hover:border-primary/50">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
              <EmptyState
                icon="directions_run"
                title="No Recent Activity"
                description="Start tracking your workouts and progress to see your activity history here"
                primaryAction={{
                  label: 'Log Workout',
                  onClick: () => router.push('/workouts'),
                  icon: 'add',
                }}
                secondaryAction={{
                  label: 'View Progress',
                  onClick: () => router.push('/progress'),
                  icon: 'insights',
                }}
                className="border-0"
              />
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
