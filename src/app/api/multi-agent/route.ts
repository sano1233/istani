import { generateText, getProviderFromEnv } from '@/lib/llm';
import { rateLimitFromRequest } from '@/lib/rate-limit';
import { validateInput } from '@/lib/security';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { searchExercises } from '@/lib/exercise-library';

// Select provider via env `LLM_PROVIDER` (huggingface | gemini | claude)
let provider = getProviderFromEnv();

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'edge';

interface MultiAgentRequest {
  userId: string;
  goal: string;
  provider?: 'huggingface' | 'gemini' | 'claude' | 'openrouter';
  model?: string;
  userProfile: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    activityLevel: number;
    fitnessGoal: string;
  };
}

type UserProfile = MultiAgentRequest['userProfile'];

// AGENT 1: Planner Agent - Decomposes goals into tasks
async function plannerAgent(goal: string, profile: UserProfile): Promise<string> {
  const prompt = `You are a Fitness Planning Agent. Analyze the user's goal and create a structured plan.

User Goal: ${goal}
User Profile: ${profile.age}yo ${profile.gender}, ${profile.weight}kg, ${profile.height}cm
Fitness Goal: ${profile.fitnessGoal}
Activity Level: ${profile.activityLevel}

Create a high-level plan with specific tasks. Be concise and actionable.

Format:
1. [Task category]: [Specific action]
2. [Task category]: [Specific action]
...`;

  return await generateText({
    provider,
    prompt,
    maxTokens: 500,
    temperature: 0.7,
    topP: 0.9,
  });
}

// AGENT 2: Exercise Specialist - Recommends exercises using RAG
async function exerciseAgent(plan: string, profile: UserProfile): Promise<string> {
  // Extract muscle groups or exercise types from plan
  const muscles = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const relevantMuscles = muscles.filter(m => plan.toLowerCase().includes(m));

  // Search exercise library (RAG simulation)
  const exercises = relevantMuscles.flatMap(muscle => searchExercises(muscle, 2));

  // Generate exercise recommendations
  const exerciseInfo = exercises.map(ex =>
    `${ex.icon} ${ex.name}: ${ex.sets} sets x ${ex.reps} reps - ${ex.description}`
  ).join('\n');

  const prompt = `You are an Exercise Science Agent. Based on the plan and exercise library, create detailed workout recommendations.

Plan: ${plan}

Available Exercises:
${exerciseInfo}

User: ${profile.age}yo ${profile.gender}, goal: ${profile.fitnessGoal}

Provide specific exercise selections, sets, reps, and form cues. Focus on safety and effectiveness.`;

  return await generateText({
    provider,
    prompt,
    maxTokens: 800,
    temperature: 0.6,
    topP: 0.9,
  });
}

// AGENT 3: Nutrition Specialist - Creates meal plans
async function nutritionAgent(plan: string, profile: UserProfile): Promise<string> {
  // Calculate TDEE
  let bmr;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }
  const tdee = Math.round(bmr * profile.activityLevel);

  let targetCalories = tdee;
  if (profile.fitnessGoal === 'lose_weight') targetCalories = tdee - 500;
  else if (profile.fitnessGoal === 'gain_muscle') targetCalories = tdee + 300;

  const protein = Math.round(profile.weight * 2);
  const fats = Math.round(profile.weight * 0.8);
  const carbs = Math.round((targetCalories - (protein * 4) - (fats * 9)) / 4);

  const prompt = `You are a Nutrition Science Agent. Create a detailed meal plan based on the fitness plan.

Plan: ${plan}

Nutrition Targets:
- Calories: ${targetCalories} kcal/day
- Protein: ${protein}g (muscle building/preservation)
- Carbs: ${carbs}g (energy for training)
- Fats: ${fats}g (hormone production)

User: ${profile.age}yo ${profile.gender}, goal: ${profile.fitnessGoal}

Create a full day meal plan with 4-5 meals. Include specific foods, portions, and macros for each meal. Focus on whole foods and balanced nutrition.`;

  return await generateText({
    provider,
    prompt,
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
  });
}

// AGENT 4: Quality Control - Reviews and synthesizes outputs
async function qualityAgent(planOutput: string, exerciseOutput: string, nutritionOutput: string): Promise<string> {
  const prompt = `You are a Quality Control Agent. Review the multi-agent outputs and synthesize them into a cohesive, actionable plan.

PLANNING OUTPUT:
${planOutput}

EXERCISE OUTPUT:
${exerciseOutput}

NUTRITION OUTPUT:
${nutritionOutput}

Create a final comprehensive plan that:
1. Combines all outputs logically
2. Removes redundancy
3. Ensures safety and realism
4. Provides clear next steps

Format as a complete, ready-to-follow program.`;

  return await generateText({
    provider,
    prompt,
    maxTokens: 1200,
    temperature: 0.5,
    topP: 0.9,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting per IP
    const rl = rateLimitFromRequest('/api/multi-agent', req.headers);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const body: MultiAgentRequest = await req.json();
    const { userId, goal, userProfile } = body;
    if (body.provider && ['huggingface', 'gemini', 'claude', 'openrouter'].includes(body.provider)) {
      provider = body.provider as any;
    }

    // Guardrail: sanitize and validate user free-text goal
    const v = validateInput(goal || '');
    if (!v.isValid) {
      return NextResponse.json({ error: 'Invalid input', reason: v.reason }, { status: 400 });
    }

    // MULTI-AGENT ORCHESTRATION
    // Step 1: Planner creates high-level plan
    console.log('🤖 Agent 1: Planning...');
    const plan = await plannerAgent(goal, userProfile);

    // Step 2: Exercise specialist selects exercises (with RAG)
    console.log('🤖 Agent 2: Selecting exercises...');
    const exercisePlan = await exerciseAgent(plan, userProfile);

    // Step 3: Nutrition specialist creates meal plan
    console.log('🤖 Agent 3: Creating nutrition plan...');
    const nutritionPlan = await nutritionAgent(plan, userProfile);

    // Step 4: Quality control synthesizes everything
    console.log('🤖 Agent 4: Quality control...');
    const finalPlanRaw = await qualityAgent(plan, exercisePlan, nutritionPlan);\n    const { safeText, flagged, reasons } = safetyFilter(finalPlanRaw, 'workout');

    // Save to database
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        name: `Multi-Agent Fitness Plan - ${new Date().toLocaleDateString()}`,
        description: safeText,
        exercises: [{
          planner: plan,
          exercise_specialist: exercisePlan,
          nutrition_specialist: nutritionPlan,
          final: safeText
        }]
      })
      .select()
      .single();

    if (error) throw error;

    // Track AI usage
    await supabase.from('ai_generations').insert({
      user_id: userId,
      generation_type: 'multi-agent-plan',
      prompt: `Goal: ${goal}`,
      response: safeText.substring(0, 1000),
      tokens_used: safeText.length
    });

    // Notify admin of multi-agent plan generation
    fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'plan_generated',
        userEmail: 'user@example.com',
        userName: 'User',
        details: {
          planType: 'complete-program',
          agentType: 'Multi-Agent (4 agents)',
          age: userProfile.age,
          gender: userProfile.gender,
          fitnessGoal: userProfile.fitnessGoal,
        },
      }),
    }).catch(console.error);

    return NextResponse.json({ success: true, plan: data, flagged, reasons: flagged ? reasons : undefined, message: 'Multi-agent system created your personalized plan!', agentDetails: { planner: 'Analyzed your goal and created high-level plan', exerciseSpecialist: 'Selected exercises from library using RAG', nutritionSpecialist: 'Calculated macros and created meal plan', qualityControl: 'Reviewed and synthesized all outputs' } }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Multi-Agent Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to generate multi-agent plan', message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
