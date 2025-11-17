import { NextRequest, NextResponse } from 'next/server';
import { OpenAIAPI } from '@/lib/api-integrations';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate AI-powered meal plan
 * POST /api/ai/meal
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
    const { goals, dietaryRestrictions, calories, macros } = body;

    if (!goals || !calories || !macros) {
      return NextResponse.json(
        { error: 'Missing required fields: goals, calories, macros' },
        { status: 400 },
      );
    }

    const openai = new OpenAIAPI();
    const mealPlan = await openai.generateMealPlan({
      goals: Array.isArray(goals) ? goals : [goals],
      dietaryRestrictions: dietaryRestrictions
        ? Array.isArray(dietaryRestrictions)
          ? dietaryRestrictions
          : [dietaryRestrictions]
        : [],
      calories: parseInt(calories),
      macros: {
        protein: parseInt(macros.protein || 0),
        carbs: parseInt(macros.carbs || 0),
        fats: parseInt(macros.fats || 0),
      },
    });

    // Save to database
    const { error: dbError } = await supabase.from('nutrition_recommendations').insert({
      user_id: user.id,
      meal_plan_data: mealPlan,
      generated_at: new Date().toISOString(),
    });

    if (dbError) {
      // eslint-disable-next-line no-console
      console.error('Error saving meal plan:', dbError);
    }

    return NextResponse.json({
      success: true,
      mealPlan: mealPlan.choices?.[0]?.message?.content || mealPlan,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
