import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, getProviderFromEnv } from '@/lib/llm';
import { rateLimitFromRequest } from '@/lib/rate-limit';
import { safetyFilter } from '@/lib/safety';
import { EnsemblePlanRequestSchema } from '@/lib/schemas';

export const runtime = 'edge';

type Provider = 'huggingface' | 'gemini' | 'claude' | 'openrouter';
type ProviderSpec = Provider | { provider: Provider; model?: string };

interface EnsemblePlanRequest {
  userId: string;
  planType: 'workout' | 'meal';
  providers?: ProviderSpec[]; // supports provider names or { provider, model }
  synthesizer?: ProviderSpec; // which model/provider to synthesize with
  userProfile: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    activityLevel: number; // 1.2-1.9
    fitnessGoal: string;   // e.g., 'gain_muscle'
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

function buildPrompt(planType: 'workout' | 'meal', userProfile: EnsemblePlanRequest['userProfile'], targets: { calories: number }) {
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
Target: ${targets.calories} calories
Protein: ${Math.round(userProfile.weight * 2)}g

Format:
Breakfast (7am):
- Food item (quantity) - calories, protein
...

Provide 4-5 meals with specific foods, portions, and macros.`;
  }
  return prompt;
}

function calcTargets(userProfile: EnsemblePlanRequest['userProfile']) {
  let bmr: number;
  if (userProfile.gender === 'male') {
    bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
  } else {
    bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
  }
  const tdee = Math.round(bmr * userProfile.activityLevel);
  let calories = tdee;
  if (userProfile.fitnessGoal === 'lose_weight') calories = tdee - 500;
  else if (userProfile.fitnessGoal === 'gain_muscle') calories = tdee + 300;
  return { calories };
}

// Synthesis prompt to merge multiple provider outputs
function buildSynthesisPrompt(planType: 'workout' | 'meal', outputs: { provider: Provider; text: string }[]) {
  const list = outputs
    .map((o, i) => `PROVIDER ${i + 1} (${o.provider.toUpperCase()}):\n${o.text}`)
    .join('\n\n---\n\n');
  return `You are a Quality Control and Synthesis Agent.
You will merge multiple AI outputs into one cohesive, concise, evidence-based ${planType} plan.

Requirements:
1) Keep the best details from each provider and remove duplicates
2) Ensure safety, progression, and realistic guidance
3) Use clear structure and actionable steps

INPUTS (from multiple providers):
${list}

Now produce a single final plan that satisfies the requirements.`;
}

export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting per IP
    const rl = rateLimitFromRequest('/api/ensemble-plan', req.headers);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
    const parsed = EnsemblePlanRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 });
    }
    const body = parsed.data;
    const { userId, planType, userProfile } = body;
    const envDefault = getProviderFromEnv();
    // If not provided, default to all configured providers (prefer Claude + Gemini together)
    let providersRaw = body.providers;
    if (!providersRaw || providersRaw.length === 0) {
      const avail: { provider: Provider }[] = [];
      if (process.env.ANTHROPIC_API_KEY) avail.push({ provider: 'claude' });
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) avail.push({ provider: 'gemini' });
      if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL) avail.push({ provider: 'openrouter' });
      if (process.env.HUGGINGFACE_API_KEY) avail.push({ provider: 'huggingface' });
      providersRaw = avail.length > 0 ? avail : [envDefault];
    }
    const providers = providersRaw.map((p) => (typeof p === 'string' ? { provider: p as Provider } : p));
    const synthRaw = body.synthesizer || (providers.find(p => p.provider === 'claude') || { provider: envDefault });
    const synthesizer = (typeof synthRaw === 'string') ? { provider: synthRaw as Provider } : synthRaw;

    // Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const targets = calcTargets(userProfile);
    const prompt = buildPrompt(planType, userProfile, targets);

    // Fan-out to all selected providers in parallel
    const fanout = await Promise.all(
      providers.map(async (p) => ({
        provider: p.provider,
        text: await generateText({ provider: p.provider, model: p.model, prompt, maxTokens: 1100, temperature: 0.7, topP: 0.95 }),
      }))
    );

    // Synthesize a final plan using preferred synthesizer
    const synthesisPrompt = buildSynthesisPrompt(planType, fanout);
    const finalTextRaw = await generateText({ provider: synthesizer.provider, model: synthesizer.model, prompt: synthesisPrompt, maxTokens: 1200, temperature: 0.6, topP: 0.9 });
    const { safeText, flagged, reasons } = safetyFilter(finalTextRaw, planType);

    // Persist to DB similar to generate-plan
    const tableName = planType === 'workout' ? 'workout_plans' : 'meal_plans';
    const planData: any = {
      user_id: userId,
      name: `${planType === 'workout' ? 'Workout' : 'Meal'} Plan (Ensemble) - ${new Date().toLocaleDateString()}`,
      description: safeText,
      ...(planType === 'workout'
        ? { exercises: [{ sources: fanout, content: safeText }] }
        : { daily_calories: targets.calories, meals: [{ sources: fanout, content: safeText }] }
      )
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert(planData)
      .select()
      .single();

    if (error) throw error;

    // Track AI usage
    await supabase.from('ai_generations').insert({
      user_id: userId,
      generation_type: `ensemble-${planType}`,
      prompt: prompt.substring(0, 500),
      response: safeText.substring(0, 1000),
      tokens_used: safeText.length,
    });

    return NextResponse.json({
      success: true,
      plan: data,
      sources: fanout.map(f => ({ provider: f.provider, preview: f.text.substring(0, 200) })),
      synthesizer,
      flagged,
      reasons: flagged ? reasons : undefined,
      message: 'Ensemble plan generated successfully',
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Ensemble Generation Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate ensemble plan', message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
