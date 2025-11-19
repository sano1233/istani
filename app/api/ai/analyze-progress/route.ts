import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiManager } from '@/lib/api-integrations';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { timeframe = '30d', includeWorkouts = true, includeNutrition = true, includeMeasurements = true } = body;

    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : timeframe === '1y' ? 365 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all relevant data
    const [workoutsData, nutritionData, measurementsData, goalsData] = await Promise.all([
      includeWorkouts
        ? supabase
            .from('workout_sessions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString())
            .order('date', { ascending: true })
        : { data: [] },

      includeNutrition
        ? supabase
            .from('meals')
            .select('*')
            .eq('user_id', user.id)
            .gte('logged_at', startDate.toISOString())
            .order('logged_at', { ascending: true })
        : { data: [] },

      includeMeasurements
        ? supabase
            .from('body_measurements')
            .select('*')
            .eq('user_id', user.id)
            .gte('measured_at', startDate.toISOString())
            .order('measured_at', { ascending: true })
        : { data: [] },

      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);

    const profile = goalsData.data;

    // Calculate statistics
    const stats = {
      workouts: {
        total: workoutsData.data?.length || 0,
        avgPerWeek: ((workoutsData.data?.length || 0) / days) * 7,
        consistency: calculateConsistency(workoutsData.data || []),
      },
      nutrition: {
        totalMeals: nutritionData.data?.length || 0,
        avgCalories: calculateAverage(nutritionData.data || [], 'calories'),
        avgProtein: calculateAverage(nutritionData.data || [], 'protein'),
        adherence: calculateNutritionAdherence(nutritionData.data || [], profile),
      },
      measurements: {
        weightChange: calculateChange(measurementsData.data || [], 'weight_kg'),
        bodyFatChange: calculateChange(measurementsData.data || [], 'body_fat_percentage'),
        trend: analyzeTrend(measurementsData.data || []),
      },
    };

    // Build comprehensive prompt for AI analysis
    const analysisPrompt = `You are an expert fitness coach analyzing a user's progress data. Provide intelligent insights and predictions.

User Profile:
- Goals: ${profile?.primary_goal || 'Not specified'}
- Current Weight: ${profile?.weight_kg || 'N/A'} kg
- Target Date: ${profile?.target_date || 'N/A'}
- Age: ${profile?.age || 'N/A'}
- Sex: ${profile?.sex || 'N/A'}

Progress Data (${timeframe}):
Workouts:
- Total sessions: ${stats.workouts.total}
- Average per week: ${stats.workouts.avgPerWeek.toFixed(1)}
- Consistency score: ${stats.workouts.consistency}%

Nutrition:
- Total meals logged: ${stats.nutrition.totalMeals}
- Average calories: ${stats.nutrition.avgCalories.toFixed(0)}
- Average protein: ${stats.nutrition.avgProtein.toFixed(0)}g
- Adherence: ${stats.nutrition.adherence}%

Body Measurements:
- Weight change: ${stats.measurements.weightChange >= 0 ? '+' : ''}${stats.measurements.weightChange.toFixed(1)} kg
- Body fat change: ${stats.measurements.bodyFatChange >= 0 ? '+' : ''}${stats.measurements.bodyFatChange.toFixed(1)}%
- Trend: ${stats.measurements.trend}

Analyze this data and provide:
1. 3 specific insights with confidence scores (0-100)
2. 2-3 predictions about goal achievement
3. Actionable recommendations for improvement
4. Patterns you've identified

Format as JSON:
{
  "insights": [
    {
      "type": "success" | "warning" | "info",
      "title": "string",
      "message": "string",
      "confidence": number,
      "actionable": "string"
    }
  ],
  "predictions": {
    "goalAchievementDate": "YYYY-MM-DD or null",
    "expectedWeightLoss": number,
    "probabilityOfSuccess": number
  },
  "patterns": [
    {
      "pattern": "string",
      "recommendation": "string"
    }
  ]
}`;

    // Use multi-model approach for best results
    let analysis;

    try {
      // Try Claude first (best for detailed analysis)
      const claudeResponse = await apiManager.claude.generateContent(analysisPrompt);
      analysis = parseAIResponse(claudeResponse);
    } catch (claudeError) {
      console.log('Claude failed, trying Gemini:', claudeError);

      try {
        // Fallback to Gemini
        const geminiResponse = await apiManager.gemini.generateContent(analysisPrompt);
        analysis = parseAIResponse(geminiResponse);
      } catch (geminiError) {
        console.log('Gemini failed, trying OpenAI:', geminiError);

        // Final fallback to OpenAI
        const openaiResponse = await apiManager.openai.analyzeProgress({
          workouts: workoutsData.data || [],
          nutrition: nutritionData.data || [],
          measurements: measurementsData.data || [],
        });
        analysis = parseAIResponse(openaiResponse);
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      analysis,
      timeframe,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Progress analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze progress',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateAverage(data: any[], field: string): number {
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);
  return sum / data.length;
}

function calculateChange(data: any[], field: string): number {
  if (!data || data.length < 2) return 0;
  const first = parseFloat(data[0][field]) || 0;
  const last = parseFloat(data[data.length - 1][field]) || 0;
  return last - first;
}

function calculateConsistency(workouts: any[]): number {
  if (!workouts || workouts.length === 0) return 0;

  // Calculate workout frequency (workouts per week)
  const weeks = Math.ceil(workouts.length / 7);
  const avgPerWeek = workouts.length / weeks;

  // Goal: 3-5 workouts per week
  if (avgPerWeek >= 4) return 100;
  if (avgPerWeek >= 3) return 85;
  if (avgPerWeek >= 2) return 60;
  if (avgPerWeek >= 1) return 40;
  return 20;
}

function calculateNutritionAdherence(meals: any[], profile: any): number {
  if (!meals || meals.length === 0 || !profile) return 0;

  // Calculate how many days user logged meals
  const uniqueDays = new Set(
    meals.map((meal) => new Date(meal.logged_at).toDateString())
  ).size;

  // Assume user should log at least 3 meals per day
  const expectedMeals = uniqueDays * 3;
  const actualMeals = meals.length;

  const adherence = Math.min((actualMeals / expectedMeals) * 100, 100);
  return Math.round(adherence);
}

function analyzeTrend(measurements: any[]): string {
  if (!measurements || measurements.length < 3) return 'insufficient_data';

  const weights = measurements.map((m) => parseFloat(m.weight_kg) || 0);

  // Calculate simple moving average trend
  const recentAvg = weights.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, weights.length);
  const olderAvg = weights.slice(0, 7).reduce((a, b) => a + b, 0) / Math.min(7, weights.length);

  const diff = recentAvg - olderAvg;

  if (Math.abs(diff) < 0.2) return 'stable';
  if (diff < 0) return 'decreasing';
  return 'increasing';
}

function parseAIResponse(response: any): any {
  try {
    // Extract JSON from response
    let jsonText = '';

    if (response.choices && response.choices[0]) {
      // OpenAI format
      jsonText = response.choices[0].message?.content || response.choices[0].text || '';
    } else if (response.candidates && response.candidates[0]) {
      // Gemini format
      jsonText = response.candidates[0].content?.parts?.[0]?.text || '';
    } else if (response.content) {
      // Claude format
      jsonText = response.content[0]?.text || response.content || '';
    } else if (typeof response === 'string') {
      jsonText = response;
    }

    // Try to extract JSON from markdown code blocks
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    // If no JSON found, return a default structure
    return {
      insights: [
        {
          type: 'info',
          title: 'Analysis Complete',
          message: 'Your progress data has been analyzed.',
          confidence: 75,
          actionable: 'Continue tracking your progress consistently',
        },
      ],
      predictions: {
        goalAchievementDate: null,
        expectedWeightLoss: 0,
        probabilityOfSuccess: 50,
      },
      patterns: [],
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      insights: [],
      predictions: {},
      patterns: [],
    };
  }
}
