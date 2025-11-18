import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const maxDuration = 60;

interface RecipeRequest {
  dietary_preferences: string[]; // ['vegetarian', 'gluten-free', etc.]
  cuisine_types: string[]; // ['italian', 'asian', etc.]
  cooking_time_max: number; // minutes
  skill_level: string; // 'beginner', 'intermediate', 'advanced'
  ingredients_available: string[]; // optional: ingredients user has
  calories_target: number; // optional: calorie target
  protein_target: number; // optional: protein target
  meal_type: string; // 'breakfast', 'lunch', 'dinner', 'snack'
  servings: number;
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

    const body: RecipeRequest = await request.json();

    // Validate input
    if (!body.meal_type || !body.skill_level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Build prompt for AI
    const prompt = buildRecipePrompt(body, profile);

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
              'You are an expert chef and nutritionist creating personalized recipe recommendations. Provide detailed, delicious, and nutritionally balanced recipes in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'Failed to generate recipe recommendations' }, { status: 500 });
    }

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    // Log AI usage for analytics
    await supabase.from('ai_recommendations').insert({
      user_id: user.id,
      recommendation_type: 'recipe',
      title: `${body.meal_type} Recipe Recommendations`,
      description: recommendations.summary || 'AI-generated recipe recommendations',
      ai_model: 'gpt-4-turbo',
      confidence_score: 0.85,
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    console.error('Error generating recipe recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildRecipePrompt(request: RecipeRequest, profile: any): string {
  return `Generate 3 personalized recipe recommendations with the following criteria:

**Meal Type:** ${request.meal_type}
**Skill Level:** ${request.skill_level}
**Dietary Preferences:** ${request.dietary_preferences.join(', ') || 'None'}
**Cuisine Preferences:** ${request.cuisine_types.join(', ') || 'Any'}
**Maximum Cooking Time:** ${request.cooking_time_max} minutes
**Servings:** ${request.servings}
${request.ingredients_available && request.ingredients_available.length > 0 ? `**Available Ingredients:** ${request.ingredients_available.join(', ')}` : ''}
${request.calories_target ? `**Target Calories per Serving:** ${request.calories_target}` : ''}
${request.protein_target ? `**Target Protein per Serving:** ${request.protein_target}g` : ''}

${profile ? `**User Profile:**
- Age: ${profile.age || 'N/A'}
- Primary Goal: ${profile.primary_goal || 'N/A'}
- Activity Level: ${profile.activity_level || 'N/A'}` : ''}

Please provide recipe recommendations in the following JSON format:
{
  "summary": "Brief overview of the recommendations (1-2 sentences)",
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief appetizing description (1-2 sentences)",
      "cuisine_type": "italian/mexican/asian/etc",
      "difficulty": "easy/medium/hard",
      "prep_time_minutes": 10,
      "cook_time_minutes": 20,
      "total_time_minutes": 30,
      "servings": 4,
      "calories_per_serving": 450,
      "protein_per_serving": 28,
      "carbs_per_serving": 42,
      "fat_per_serving": 14,
      "fiber_per_serving": 6,
      "ingredients": [
        {
          "name": "chicken breast",
          "amount": 500,
          "unit": "g",
          "category": "meat",
          "notes": "skinless, boneless"
        }
      ],
      "instructions": [
        "Step 1: Detailed instruction",
        "Step 2: Detailed instruction"
      ],
      "cooking_tips": [
        "Helpful tip 1",
        "Helpful tip 2"
      ],
      "nutritional_highlights": [
        "High in protein",
        "Rich in fiber"
      ],
      "substitutions": [
        "Can substitute chicken with turkey or tofu"
      ],
      "storage_instructions": "Store in airtight container for up to 3 days",
      "meal_prep_friendly": true,
      "why_recommended": "Explanation of why this recipe matches the user's needs"
    }
  ],
  "meal_planning_tips": [
    "Tip 1 for planning meals with these recipes",
    "Tip 2 for grocery shopping"
  ],
  "nutrition_insights": "Brief analysis of the nutritional balance of these recipes"
}

Make sure the recipes:
1. Match the dietary preferences and restrictions
2. Use ingredients that are commonly available or specified
3. Are appropriate for the skill level
4. Can be prepared within the time constraint
5. Meet or come close to calorie and protein targets if specified
6. Are delicious, practical, and nutritionally balanced
7. Include clear, easy-to-follow instructions
8. Provide helpful cooking tips and substitution options`;
}
