import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';


export default async function ProgressPage() {
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
            <h1 className="text-4xl font-black text-white mb-2">Progress</h1>
            <p className="text-white/60">Track your fitness journey and achievements</p>
          </div>
          <Button className="gap-2">
            <span className="material-symbols-outlined">add</span>
            Add Entry
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  trending_down
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Weight Change</p>
                <p className="text-2xl font-bold text-white">-- kg</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">show_chart</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Body Fat %</p>
                <p className="text-2xl font-bold text-white">-- %</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  calendar_month
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Days Tracked</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  workspace_premium
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Achievements</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Chart Placeholder */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Weight Progress</h2>
          <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-white/5">
            <div className="text-center">
              <span className="material-symbols-outlined text-white/20 text-6xl mb-4 block">
                insert_chart
              </span>
              <p className="text-white/60">Start tracking your weight to see your progress chart</p>
            </div>
          </div>
        </Card>

        {/* Recent Entries */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Entries</h2>
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-white/20 text-6xl mb-4 block">
              history
            </span>
            <p className="text-white/60 mb-6">No progress entries yet. Start tracking today!</p>
            <Button className="gap-2">
              <span className="material-symbols-outlined">add</span>
              Add First Entry
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
