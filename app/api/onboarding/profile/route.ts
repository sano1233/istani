import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/onboarding/profile
 * Save user onboarding profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, profile } = body;

    if (!user_id || !profile) {
      return NextResponse.json(
        { error: 'user_id and profile are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user_id,
        full_name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        current_weight: profile.current_weight,
        target_weight: profile.target_weight,
        fitness_goal: profile.fitness_goal,
        activity_level: profile.activity_level,
        workout_days_per_week: profile.workout_days_per_week,
        dietary_preference: profile.dietary_preference,
        allergies: profile.allergies,
        daily_calorie_target: profile.daily_calorie_target,
        macro_targets: profile.macro_targets,
        notifications_enabled: profile.notifications_enabled,
        reminder_times: profile.reminder_times,
        measurement_system: profile.measurement_system,
        connected_devices: profile.connected_devices,
        ai_features_enabled: profile.ai_features_enabled,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Error saving profile:', profileError);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    // Create initial body measurement
    if (profile.current_weight && profile.height) {
      const bmi = (profile.current_weight / (profile.height * profile.height)) * 703;

      await supabase.from('body_measurements').insert({
        user_id,
        weight: profile.current_weight,
        bmi: parseFloat(bmi.toFixed(1)),
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in onboarding profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
