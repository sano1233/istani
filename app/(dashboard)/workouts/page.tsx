import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Workouts</h1>
            <p className="text-white/60">Track your training and stay consistent</p>
          </div>
          <Button className="gap-2">
            <span className="material-symbols-outlined">add</span>
            New Workout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  calendar_today
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">0 workouts</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-white">0 days</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  fitness_center
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Workouts</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Empty State */}
        <Card className="text-center py-20">
          <span className="material-symbols-outlined text-white/20 text-9xl mb-4 block">
            fitness_center
          </span>
          <h2 className="text-2xl font-bold text-white mb-4">No workouts yet</h2>
          <p className="text-white/60 mb-8">
            Start tracking your workouts to build your fitness journey
          </p>
          <Button size="lg" className="gap-2">
            <span className="material-symbols-outlined">add</span>
            Log Your First Workout
          </Button>
        </Card>
      </div>
    </main>
  );
}
