import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { generateMealPlan, getAvailableProviders } from '@/lib/ai-providers';

/**
 * Generate AI-powered meal plan
 * POST /api/ai/meal
 *
 * Uses multiple AI providers with automatic fallback:
 * - Google Gemini (fastest, free tier available)
 * - Alibaba Qwen (fast, cost-effective)
 * - OpenRouter (variety of models)
 * - OpenAI (reliable fallback)
 */
export async function POST(request: NextRequest) {
  try {
    // CRITICAL: In Next.js 15, headers() must be awaited
    const headerList = await headers();
    const contentType = headerList.get('content-type');

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if any AI provider is available
    const providers = getAvailableProviders();
    if (providers.length === 0) {
      return NextResponse.json(
        {
          error: 'No AI providers configured',
          hint: 'Please set one of: GEMINI_API_KEY, QWEN_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY',
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { goals, dietaryRestrictions, calories, macros } = body;

    if (!calories) {
      return NextResponse.json({ error: 'Missing required field: calories' }, { status: 400 });
    }

    // Generate meal plan using best available provider
    const mealPlan = await generateMealPlan({
      calories: parseInt(calories),
      protein: parseInt(macros?.protein || Math.round((parseInt(calories) * 0.3) / 4)), // 30% from protein
      carbs: macros?.carbs ? parseInt(macros.carbs) : undefined,
      fats: macros?.fats ? parseInt(macros.fats) : undefined,
      dietaryRestrictions: dietaryRestrictions
        ? Array.isArray(dietaryRestrictions)
          ? dietaryRestrictions
          : [dietaryRestrictions]
        : [],
      goals: goals ? (Array.isArray(goals) ? goals : [goals]) : [],
    });

    // Save to database
    const { error: dbError } = await supabase.from('nutrition_recommendations').insert({
      user_id: user.id,
      meal_plan_data: mealPlan,
      generated_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Error saving meal plan:', dbError);
    }

    return NextResponse.json({
      success: true,
      mealPlan,
      providers_available: providers,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI meal generation error:', errorMessage);

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/ai/meal - Get available AI providers status
 */
export async function GET() {
  const providers = getAvailableProviders();

  return NextResponse.json({
    available_providers: providers,
    primary_provider: providers[0] || null,
    configured: {
      gemini: !!process.env.GEMINI_API_KEY,
      qwen: !!process.env.QWEN_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
    },
  });
}
