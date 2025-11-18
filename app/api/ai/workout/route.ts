import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI } from '@/lib/unified-ai-client';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Generate AI-powered workout plan with unified AI client
 * POST /api/ai/workout
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goals, fitnessLevel, equipment, timeAvailable } = body;

    if (!goals || !fitnessLevel) {
      return NextResponse.json(
        { error: 'Goals and fitness level are required' },
        { status: 400 }
      );
    }

    // Generate workout plan using unified AI (multi-provider with fallback)
    const response = await unifiedAI.generateWorkoutPlan(
      goals,
      fitnessLevel,
      equipment || ['bodyweight']
    );

    // Save to database
    const { error: dbError } = await supabase.from('workout_recommendations').insert({
      user_id: user.id,
      workout_data: {
        plan: response.content,
        goals,
        fitnessLevel,
        equipment: equipment || ['bodyweight'],
        timeAvailable: timeAvailable || null,
        model: response.model,
        provider: response.provider,
      },
      generated_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Error saving workout plan:', dbError);
      // Continue anyway - don't fail the request if DB save fails
    }

    return NextResponse.json({
      success: true,
      workoutPlan: response.content,
      model: response.model,
      provider: response.provider,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Workout generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate workout plan',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
