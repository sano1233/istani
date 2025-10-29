import { generateText, getProviderFromEnv } from '@/lib/llm';
import { rateLimitFromRequest } from '@/lib/rate-limit';
import { safetyFilter } from '@/lib/safety';
import { GeneratePlanRequestSchema } from '@/lib/schemas';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Provider selected via env `LLM_PROVIDER` (huggingface | gemini | claude)
const provider = getProviderFromEnv();

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'edge';

interface GeneratePlanRequest {
  userId: string;
  planType: 'workout' | 'meal';
  provider?: 'huggingface' | 'gemini' | 'claude' | 'openrouter';
  model?: string; // optional (e.g., for openrouter)
  userProfile: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    activityLevel: number;
    fitnessGoal: string;
  };
}

const FITNESS_KNOWLEDGE = `You are an expert fitness coach. Provide evidence-based workout and nutrition plans.

For workouts:
- Progressive overload
- 10-20 sets per muscle per week
- 6-12 reps for hypertrophy
- Compound movements priority

For nutrition:
- Protein: 1.6-2.2g/kg bodyweight
- Calorie deficit for fat loss
- Surplus for muscle gain
- Whole foods focus`;

export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting per IP
    const rl = rateLimitFromRequest('/api/generate-plan', req.headers);
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' } });
    }
    const parsed = GeneratePlanRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 });
    }
    const body = parsed.data;
    const { userId, planType, userProfile } = body;
    const selectedProvider = (body.provider as any) || provider;

    // Calculate TDEE
    let bmr;
    if (userProfile.gender === 'male') {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }
    const tdee = Math.round(bmr * userProfile.activityLevel);

    let targetCalories = tdee;
    if (userProfile.fitnessGoal === 'lose_weight') targetCalories = tdee - 500;
    else if (userProfile.fitnessGoal === 'gain_muscle') targetCalories = tdee + 300;

    // Build prompt
    let prompt = `${FITNESS_KNOWLEDGE}\n\n`;

    if (planType === 'workout') {
      prompt += `Create a 4-day workout plan for ${userProfile.age}yo ${userProfile.gender}, ${userProfile.weight}kg, goal: ${userProfile.fitnessGoal}.

Format:
Day 1 - Chest/Triceps:
- Bench Press: 4 sets x 8-10 reps
- Incline Dumbbell Press: 3 sets x 10-12 reps
...

Provide 4 complete workout days with exercises, sets, reps, and brief form tips.`;
    } else {
      prompt += `Create a daily meal plan for ${userProfile.age}yo ${userProfile.gender}, ${userProfile.weight}kg.
Target: ${targetCalories} calories
Protein: ${Math.round(userProfile.weight * 2)}g

Format:
Breakfast (7am):
- Food item (quantity) - calories, protein
...

Provide 4-5 meals with specific foods, portions, and macros.`;
    }

    // Generate with selected provider (HuggingFace, Gemini, or Claude)
    const generatedText = await generateText({
      provider: selectedProvider,
      model: body.model,
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.95,
    });

    const { safeText, flagged, reasons } = safetyFilter(generatedText, planType);

    // Save to database
    const tableName = planType === 'workout' ? 'workout_plans' : 'meal_plans';

    const planData = {
      user_id: userId,
      name: `${planType === 'workout' ? 'Workout' : 'Meal'} Plan - ${new Date().toLocaleDateString()}`,
      description: safeText,
      ...(planType === 'workout'
        ? { exercises: [{ content: safeText }] }
        : {
            daily_calories: targetCalories,
            meals: [{ content: safeText }]
          }
      )
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert(planData)
      .select()
      .single();

    if (error) throw error;

    // Track generation
    await supabase.from('ai_generations').insert({
      user_id: userId,
      generation_type: planType,
      prompt: prompt.substring(0, 500),
      response: safeText.substring(0, 1000),
      tokens_used: safeText.length,
    });

    // Notify admin of plan generation (async, don't wait)
    fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'plan_generated',
        userEmail: 'user@example.com', // Get from session
        userName: 'User',
        details: {
          planType,
          agentType: 'Single Agent',
          age: userProfile.age,
          gender: userProfile.gender,
          fitnessGoal: userProfile.fitnessGoal,
        },
      }),
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      plan: data,
      rateLimit: { remaining: rl.remaining, resetAt: rl.resetAt },
      flagged,
      reasons: flagged ? reasons : undefined,
      message: `Your ${planType} plan is ready!`
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Generation Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate plan', message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
