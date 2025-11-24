import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const maxDuration = 60;

interface WorkoutPlanRequest {
  goal: string; // 'weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'
  experience_level: string; // 'beginner', 'intermediate', 'advanced'
  days_per_week: number;
  equipment: string[]; // ['bodyweight', 'dumbbells', 'barbell', 'machines', 'full_gym']
  duration_minutes: number;
  preferences?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: WorkoutPlanRequest = await request.json();

    // Validate input
    if (!body.goal || !body.experience_level || !body.days_per_week) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user profile for personalization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Log profile fetch error but continue with null profile
    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    // Build prompt for AI
    const prompt = buildWorkoutPlanPrompt(body, profile);

    // Call OpenAI API
    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert fitness coach creating personalized workout plans. Provide detailed, safe, and effective workout routines in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'Failed to generate workout plan' }, { status: 500 });
    }

    const data = await response.json();
    const workoutPlan = JSON.parse(data.choices[0].message.content);

    // Log AI usage for analytics
    await supabase.from('ai_recommendations').insert({
      user_id: user.id,
      recommendation_type: 'workout',
      title: `${body.days_per_week}-Day ${body.goal} Plan`,
      description: workoutPlan.description || 'AI-generated workout plan',
      ai_model: 'gpt-4-turbo',
      confidence_score: 0.9,
    });

    return NextResponse.json({
      success: true,
      plan: workoutPlan,
    });
  } catch (error: any) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

function buildWorkoutPlanPrompt(request: WorkoutPlanRequest, profile: any): string {
  return `Create a comprehensive ${request.days_per_week}-day workout plan with the following details:

Goal: ${request.goal}
Experience Level: ${request.experience_level}
Days per Week: ${request.days_per_week}
Equipment Available: ${request.equipment.join(', ')}
Workout Duration: ${request.duration_minutes} minutes per session
${request.preferences ? `Additional Preferences: ${request.preferences}` : ''}

${
  profile
    ? `User Profile:
- Age: ${profile.age || 'N/A'}
- Weight: ${profile.weight_kg || 'N/A'} kg
- Height: ${profile.height_cm || 'N/A'} cm
- Primary Goal: ${profile.primary_goal || 'N/A'}`
    : ''
}

Please provide a workout plan in the following JSON format:
{
  "plan_name": "Descriptive name for the plan",
  "description": "Brief overview of the plan (2-3 sentences)",
  "duration_weeks": 4-12,
  "workouts": [
    {
      "day": 1,
      "name": "Workout name (e.g., Upper Body Strength)",
      "focus": "Primary focus areas",
      "warm_up": {
        "duration_minutes": 5-10,
        "exercises": ["exercise1", "exercise2"]
      },
      "main_exercises": [
        {
          "name": "Exercise name",
          "sets": 3-5,
          "reps": "8-12 or time in seconds",
          "rest_seconds": 60-120,
          "notes": "Form cues and tips",
          "difficulty": "beginner/intermediate/advanced"
        }
      ],
      "cool_down": {
        "duration_minutes": 5-10,
        "exercises": ["stretch1", "stretch2"]
      },
      "estimated_calories": 200-600
    }
  ],
  "progression_tips": ["tip1", "tip2", "tip3"],
  "nutrition_recommendations": "Brief nutrition advice",
  "rest_days": [3, 6],
  "safety_notes": ["note1", "note2"]
}

Make sure the plan is:
1. Safe and appropriate for the experience level
2. Balanced and targets all major muscle groups
3. Progressive and allows for adaptation
4. Includes warm-up and cool-down
5. Realistic for the time available
6. Varied to prevent boredom
7. Aligned with the stated goal`;
}
