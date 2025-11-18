import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/onboarding/status
 * Check if user has completed onboarding
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking onboarding status:', error);
      return NextResponse.json({ completed: false });
    }

    return NextResponse.json({ completed: data?.onboarding_completed || false });
  } catch (error) {
    console.error('Error in onboarding status API:', error);
    return NextResponse.json({ completed: false });
  }
}
