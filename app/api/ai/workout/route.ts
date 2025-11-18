import { NextRequest, NextResponse } from 'next/server';
import { OpenAIAPI } from '@/lib/api-integrations';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate AI-powered workout plan
 * POST /api/ai/workout
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goals, experience, equipment, timeAvailable } = body;

    if (!goals || !experience || !equipment || !timeAvailable) {
      return NextResponse.json(
        { error: 'Missing required fields: goals, experience, equipment, timeAvailable' },
        { status: 400 }
      );
    }

    const openai = new OpenAIAPI();
    const workoutPlan = await openai.generateWorkoutPlan({
      goals: Array.isArray(goals) ? goals : [goals],
      experience,
      equipment: Array.isArray(equipment) ? equipment : [equipment],
      timeAvailable: parseInt(timeAvailable),
    });

    // Save to database
    const { error: dbError } = await supabase.from('workout_recommendations').insert({
      user_id: user.id,
      workout_data: workoutPlan,
      generated_at: new Date().toISOString(),
    });

    if (dbError) {
      // eslint-disable-next-line no-console
      console.error('Error saving workout plan:', dbError);
    }

    return NextResponse.json({
      success: true,
      workoutPlan: workoutPlan.choices?.[0]?.message?.content || workoutPlan,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
