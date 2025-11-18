import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/analytics/user
 * Get comprehensive user analytics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const days = parseInt(searchParams.get('days') || '30');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get workout stats
    const { data: workouts, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    // Get meal stats
    const { data: meals, error: mealError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    // Get body measurements
    const { data: measurements, error: measurementError } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    // Get achievements
    const { data: achievements, error: achievementError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    // Get friends count
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    // Get challenges
    const { data: challenges, error: challengesError } = await supabase
      .from('challenge_participants')
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Calculate metrics
    const totalWorkouts = workouts?.length || 0;
    const totalMeals = meals?.length || 0;

    // Calculate streak (simplified - should check consecutive days)
    const activeDays = new Set(
      [...(workouts || []), ...(meals || [])].map((item) =>
        new Date(item.created_at).toDateString()
      )
    ).size;

    const streakDays = activeDays; // Simplified - should calculate actual consecutive days

    // Calculate nutrition averages
    const avgDailyCalories =
      meals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) / activeDays || 0;
    const avgDailyProtein =
      meals?.reduce((sum, meal) => sum + (meal.protein || 0), 0) / activeDays || 0;

    // Calculate weight change
    let weightChange30d = 0;
    if (measurements && measurements.length >= 2) {
      const recentMeasurements = measurements.slice(-2);
      weightChange30d =
        (recentMeasurements[1]?.weight || 0) - (recentMeasurements[0]?.weight || 0);
    }

    const analytics = {
      user_id: userId,
      total_workouts: totalWorkouts,
      total_meals_logged: totalMeals,
      streak_days: streakDays,
      avg_daily_calories: avgDailyCalories,
      avg_daily_protein: avgDailyProtein,
      weight_change_30d: weightChange30d,
      active_days_30d: activeDays,
      achievements_unlocked: achievements?.length || 0,
      friends_count: friends?.length || 0,
      challenges_completed: challenges?.length || 0,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
