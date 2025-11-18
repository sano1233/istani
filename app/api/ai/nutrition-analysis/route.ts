import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const maxDuration = 60;

interface NutritionAnalysisRequest {
  timeframe_days?: number; // Default 7 days
  goal?: string; // 'weight_loss', 'muscle_gain', 'maintenance'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: NutritionAnalysisRequest = await request.json();
    const timeframeDays = body.timeframe_days || 7;

    // Get user profile and nutrition goals
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: nutritionGoal } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get recent meals
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframeDays);

    const { data: recentMeals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('meal_date', startDate.toISOString().split('T')[0])
      .order('meal_date', { ascending: false });

    // Get recent workouts for activity level
    const { data: recentWorkouts } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('workout_date', startDate.toISOString().split('T')[0]);

    // Calculate daily averages
    const dailyStats = calculateDailyStats(recentMeals || []);
    const activityLevel = calculateActivityLevel(recentWorkouts || []);

    // Build AI prompt
    const prompt = buildNutritionAnalysisPrompt(
      profile,
      nutritionGoal,
      dailyStats,
      activityLevel,
      body.goal
    );

    // Call OpenAI
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
              'You are an expert nutritionist and dietitian providing detailed, personalized nutrition analysis and recommendations. Provide practical, actionable advice in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Save recommendation
    await supabase.from('ai_recommendations').insert({
      user_id: user.id,
      recommendation_type: 'nutrition',
      title: 'Nutrition Analysis & Recommendations',
      description: JSON.stringify(analysis),
      ai_model: 'gpt-4-turbo',
      confidence_score: 0.85,
    });

    return NextResponse.json({
      success: true,
      analysis,
      user_stats: {
        daily_averages: dailyStats,
        activity_level: activityLevel,
        days_analyzed: timeframeDays,
      },
    });
  } catch (error: any) {
    console.error('Error analyzing nutrition:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateDailyStats(meals: any[]) {
  if (meals.length === 0) {
    return {
      avg_calories: 0,
      avg_protein: 0,
      avg_carbs: 0,
      avg_fat: 0,
      days_tracked: 0,
    };
  }

  // Group by date
  const dailyTotals = new Map<
    string,
    { calories: number; protein: number; carbs: number; fat: number }
  >();

  meals.forEach((meal) => {
    const existing = dailyTotals.get(meal.meal_date) || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    dailyTotals.set(meal.meal_date, {
      calories: existing.calories + (meal.calories || 0),
      protein: existing.protein + (meal.protein_g || 0),
      carbs: existing.carbs + (meal.carbs_g || 0),
      fat: existing.fat + (meal.fat_g || 0),
    });
  });

  const days = dailyTotals.size;
  const totals = Array.from(dailyTotals.values()).reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    avg_calories: Math.round(totals.calories / days),
    avg_protein: Math.round(totals.protein / days),
    avg_carbs: Math.round(totals.carbs / days),
    avg_fat: Math.round(totals.fat / days),
    days_tracked: days,
  };
}

function calculateActivityLevel(workouts: any[]): string {
  const avgWorkoutsPerWeek = (workouts.length / 7) * 7;

  if (avgWorkoutsPerWeek >= 5) return 'very_active';
  if (avgWorkoutsPerWeek >= 3) return 'active';
  if (avgWorkoutsPerWeek >= 1) return 'moderate';
  return 'sedentary';
}

function buildNutritionAnalysisPrompt(
  profile: any,
  nutritionGoal: any,
  dailyStats: any,
  activityLevel: string,
  userGoal?: string
): string {
  return `Analyze this user's nutrition and provide detailed recommendations in JSON format.

USER PROFILE:
- Age: ${profile?.age || 'N/A'}
- Weight: ${profile?.weight_kg || 'N/A'} kg
- Height: ${profile?.height_cm || 'N/A'} cm
- Sex: ${profile?.sex || 'N/A'}
- Primary Goal: ${userGoal || profile?.primary_goal || 'general fitness'}
- Activity Level: ${activityLevel}

CURRENT NUTRITION (Last ${dailyStats.days_tracked} days):
- Average Calories: ${dailyStats.avg_calories}
- Average Protein: ${dailyStats.avg_protein}g
- Average Carbs: ${dailyStats.avg_carbs}g
- Average Fat: ${dailyStats.avg_fat}g

NUTRITION GOALS:
${
  nutritionGoal
    ? `- Target Calories: ${nutritionGoal.daily_calories}
- Target Protein: ${nutritionGoal.protein_g}g
- Target Carbs: ${nutritionGoal.carbs_g}g
- Target Fat: ${nutritionGoal.fat_g}g`
    : '- No specific goals set'
}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "2-3 sentence overview of their current nutrition status",
  "overall_score": 0-100,
  "calorie_analysis": {
    "status": "on_track/under/over",
    "variance_percentage": -50 to 50,
    "recommendation": "specific advice",
    "ideal_range": "1800-2200 calories"
  },
  "macro_analysis": {
    "protein": {
      "status": "adequate/low/high",
      "current_percentage": 0-100,
      "ideal_percentage": 0-100,
      "recommendation": "specific advice"
    },
    "carbs": {...},
    "fat": {...}
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "areas_for_improvement": ["area1", "area2", "area3"],
  "meal_timing_recommendations": [
    {
      "meal": "breakfast",
      "timing": "7:00-9:00 AM",
      "composition": "High protein, moderate carbs",
      "example": "Eggs with oatmeal and berries"
    }
  ],
  "food_suggestions": {
    "add_more": ["food1", "food2", "food3"],
    "reduce": ["food1", "food2"],
    "avoid": ["food1", "food2"]
  },
  "hydration": {
    "recommended_water_ml": 2000-4000,
    "timing_tips": ["tip1", "tip2"]
  },
  "supplement_recommendations": [
    {
      "supplement": "name",
      "reason": "why needed",
      "dosage": "amount and timing",
      "priority": "high/medium/low"
    }
  ],
  "quick_wins": [
    "Easy change 1 they can make today",
    "Easy change 2",
    "Easy change 3"
  ],
  "weekly_meal_plan_ideas": [
    {
      "day": "Monday",
      "breakfast": "meal idea",
      "lunch": "meal idea",
      "dinner": "meal idea",
      "snacks": "snack ideas"
    }
  ],
  "progress_tracking_tips": ["tip1", "tip2", "tip3"],
  "next_steps": ["action1", "action2", "action3"]
}

Make recommendations:
1. Science-based and evidence-backed
2. Practical and easy to implement
3. Aligned with their specific goal
4. Sustainable long-term
5. Culturally sensitive
6. Budget-friendly when possible`;
}
