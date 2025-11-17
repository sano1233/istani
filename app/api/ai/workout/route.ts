import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI } from '@/lib/unified-ai-client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goals, fitnessLevel, equipment } = body;

    if (!goals || !fitnessLevel) {
      return NextResponse.json({ error: 'Goals and fitness level are required' }, { status: 400 });
    }

    const response = await unifiedAI.generateWorkoutPlan(
      goals,
      fitnessLevel,
      equipment || ['bodyweight'],
    );

    return NextResponse.json({
      success: true,
      workoutPlan: response.content,
      model: response.model,
      provider: response.provider,
    });
  } catch (error: any) {
    console.error('Workout generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate workout plan',
      },
      { status: 500 },
    );
  }
}
