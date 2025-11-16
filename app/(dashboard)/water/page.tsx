import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterTracker } from '@/components/water-tracker';
import { calculateWaterIntake } from '@/lib/fitness-calculations';

export const metadata = {
  title: 'Water Tracking - Istani Fitness',
  description: 'Track your daily water intake'
};

export default async function WaterPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for weight-based calculation
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_weight_kg, activity_level')
    .eq('id', user.id)
    .single();

  // Calculate recommended water intake
  const recommendedGlasses = profile?.current_weight_kg
    ? calculateWaterIntake(profile.current_weight_kg, profile.activity_level || 'moderate')
    : 8;

  // Get today's water intake
  const today = new Date().toISOString().split('T')[0];
  const { data: waterIntake } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // Get last 7 days of water intake
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: weekData } = await supabase
    .from('water_intake')
    .select('date, glasses_consumed, daily_goal')
    .eq('user_id', user.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Get current streak
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', user.id)
    .eq('streak_type', 'water')
    .single();

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Water Tracking</h1>
          <p className="text-white/60">Stay hydrated for optimal performance and recovery</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Today's Progress</p>
                  <p className="text-3xl font-bold text-primary">
                    {waterIntake?.glasses_consumed || 0}/
                    {waterIntake?.daily_goal || recommendedGlasses}
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary text-5xl">water_drop</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-white">
                    {streak?.current_streak || 0} days
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary text-5xl">
                  local_fire_department
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Best Streak</p>
                  <p className="text-3xl font-bold text-white">
                    {streak?.longest_streak || 0} days
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary text-5xl">
                  emoji_events
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Water Tracker */}
        <WaterTracker
          userId={user.id}
          currentGlasses={waterIntake?.glasses_consumed || 0}
          dailyGoal={waterIntake?.daily_goal || recommendedGlasses}
          recommendedGlasses={recommendedGlasses}
          loggedTimes={waterIntake?.logged_times || []}
        />

        {/* Weekly Chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>7-Day History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekData?.map(day => {
                const percentage = (day.glasses_consumed / day.daily_goal) * 100;
                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {day.glasses_consumed}/{day.daily_goal}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage >= 100 ? 'bg-primary' : 'bg-white/40'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hydration Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Hydration Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Start Your Day</h4>
                  <p className="text-sm text-white/60">
                    Drink 1-2 glasses immediately after waking up
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Pre-Workout</h4>
                  <p className="text-sm text-white/60">Hydrate 15-20 minutes before exercise</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">restaurant</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Before Meals</h4>
                  <p className="text-sm text-white/60">Drink water 30 minutes before eating</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">bedtime</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Evening Cutoff</h4>
                  <p className="text-sm text-white/60">
                    Stop 1-2 hours before bed to avoid sleep disruption
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
