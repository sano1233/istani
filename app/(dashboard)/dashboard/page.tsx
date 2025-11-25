import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { calculateBMI, calculateBMR, calculateTDEE } from '@/lib/fitness-calculations';

export const dynamic = 'force-dynamic';


export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const bmi =
    profile?.weight_kg && profile?.height_cm
      ? calculateBMI(profile.weight_kg, profile.height_cm)
      : null;

  const bmr =
    profile?.weight_kg && profile?.height_cm && profile?.age && profile?.sex
      ? calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.sex)
      : null;

  const tdee = bmr ? calculateTDEE(bmr, 'moderate') : null;

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">scale</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Current Weight</p>
                <p className="text-2xl font-bold text-white">
                  {profile?.weight_kg ? `${profile.weight_kg} kg` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">BMI</p>
                <p className="text-2xl font-bold text-white">{bmi || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">
                  local_fire_department
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Daily Calories</p>
                <p className="text-2xl font-bold text-white">{tdee ? `${tdee}` : 'N/A'}</p>
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
                <p className="text-white/60 text-sm">Body Fat %</p>
                <p className="text-2xl font-bold text-white">
                  {profile?.body_fat_percentage ? `${profile.body_fat_percentage}%` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Your Fitness Goals</h2>
            {profile?.primary_goal ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <p className="text-white">{profile.primary_goal}</p>
                </div>
                {profile.target_weight_kg && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">flag</span>
                    <p className="text-white">Target Weight: {profile.target_weight_kg} kg</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/60">
                Set your fitness goals in your profile settings to get started.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
            <p className="text-white/60">
              Start tracking your workouts and progress to see your activity here.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
