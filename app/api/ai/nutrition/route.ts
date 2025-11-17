import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI } from '@/lib/unified-ai-client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { calories, macros, dietaryRestrictions } = body;

    if (!calories || !macros) {
      return NextResponse.json({ error: 'Calories and macros are required' }, { status: 400 });
    }

    const response = await unifiedAI.generateNutritionPlan(
      calories,
      macros,
      dietaryRestrictions || [],
    );

    return NextResponse.json({
      success: true,
      nutritionPlan: response.content,
      model: response.model,
      provider: response.provider,
    });
  } catch (error: any) {
    console.error('Nutrition generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate nutrition plan',
      },
      { status: 500 },
    );
  }
}
