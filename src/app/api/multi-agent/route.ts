import { HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { searchExercises } from '@/lib/exercise-library';

// Initialize Hugging Face (FREE - no cost!)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'edge';

interface MultiAgentRequest {
  userId: string;
  goal: string;
  userProfile: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    activityLevel: number;
    fitnessGoal: string;
  };
}

// AGENT 1: Planner Agent - Decomposes goals into tasks
async function plannerAgent(goal: string, profile: any): Promise<string> {
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

  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    inputs: prompt,
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    }
  });

  return response.generated_text;
}

// AGENT 2: Exercise Specialist - Recommends exercises using RAG
async function exerciseAgent(plan: string, profile: any): Promise<string> {
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

  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    inputs: prompt,
    parameters: {
      max_new_tokens: 800,
      temperature: 0.6,
      top_p: 0.9,
    }
  });

  return response.generated_text;
}

// AGENT 3: Nutrition Specialist - Creates meal plans
async function nutritionAgent(plan: string, profile: any): Promise<string> {
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

  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    inputs: prompt,
    parameters: {
      max_new_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
    }
  });

  return response.generated_text;
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

  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    inputs: prompt,
    parameters: {
      max_new_tokens: 1200,
      temperature: 0.5,
      top_p: 0.9,
    }
  });

  return response.generated_text;
}

export async function POST(req: NextRequest) {
  try {
    const body: MultiAgentRequest = await req.json();
    const { userId, goal, userProfile } = body;

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
    const finalPlan = await qualityAgent(plan, exercisePlan, nutritionPlan);

    // Save to database
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        name: `Multi-Agent Fitness Plan - ${new Date().toLocaleDateString()}`,
        description: finalPlan,
        exercises: [{
          planner: plan,
          exercise_specialist: exercisePlan,
          nutrition_specialist: nutritionPlan,
          final: finalPlan
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
      response: finalPlan.substring(0, 1000),
      tokens_used: finalPlan.length
    });

    return NextResponse.json({
      success: true,
      plan: data,
      message: '✅ Multi-agent system created your personalized plan!',
      agentDetails: {
        planner: 'Analyzed your goal and created high-level plan',
        exerciseSpecialist: 'Selected exercises from library using RAG',
        nutritionSpecialist: 'Calculated macros and created meal plan',
        qualityControl: 'Reviewed and synthesized all outputs'
      }
    });

  } catch (error: any) {
    console.error('Multi-Agent Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate multi-agent plan', message: error.message },
      { status: 500 }
    );
  }
}
