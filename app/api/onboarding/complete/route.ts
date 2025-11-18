import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/onboarding/complete
 * Mark onboarding as completed for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Update user metadata to mark onboarding as complete
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    if (error) {
      console.error('Error completing onboarding:', error);
      return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
    }

    // Grant welcome achievement
    await supabase.from('user_achievements').insert({
      user_id,
      achievement_id: 'welcome',
      unlocked_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in onboarding complete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
