import { HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Hugging Face (FREE - no cost to you!)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'edge';

interface GeneratePlanRequest {
  userId: string;
  planType: 'workout' | 'meal';
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
    const body: GeneratePlanRequest = await req.json();
    const { userId, planType, userProfile } = body;

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

    // Call Hugging Face FREE model (no cost!)
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
      }
    });

    const generatedText = response.generated_text;

    // Save to database
    const tableName = planType === 'workout' ? 'workout_plans' : 'meal_plans';

    const planData = {
      user_id: userId,
      name: `${planType === 'workout' ? 'Workout' : 'Meal'} Plan - ${new Date().toLocaleDateString()}`,
      description: generatedText,
      ...(planType === 'workout'
        ? { exercises: [{ content: generatedText }] }
        : {
            daily_calories: targetCalories,
            meals: [{ content: generatedText }]
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
      response: generatedText.substring(0, 1000),
      tokens_used: generatedText.length
    });

    return NextResponse.json({
      success: true,
      plan: data,
      message: `Your ${planType} plan is ready!`
    });

  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan', message: error.message },
      { status: 500 }
    );
  }
}
