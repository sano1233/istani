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
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Use Gemini Vision to analyze the food photo
    const prompt = `Analyze this food image and identify all food items visible. For each food item, provide:
1. Name of the food
2. Estimated serving size
3. Estimated calories
4. Estimated macros (protein, carbs, fats in grams)
5. Confidence level (high, medium, low)

Format your response as a JSON array of foods:
[
  {
    "name": "string",
    "serving_size": "string",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "confidence": "high" | "medium" | "low",
    "notes": "optional notes about portion size or preparation method"
  }
]

If you cannot identify the food clearly, still provide your best estimate but mark confidence as "low".`;

    try {
      // Try Gemini first (best for vision)
      const geminiResponse = await apiManager.gemini.analyzeImage(image, prompt);

      if (geminiResponse && geminiResponse.text) {
        // Parse the response
        const responseText = geminiResponse.text;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          const detectedFoods = JSON.parse(jsonMatch[0]);

          // Enhance with database nutrition data if available
          const enhancedFoods = await Promise.all(
            detectedFoods.map(async (food: any) => {
              try {
                // Search for exact nutrition data
                const searchResponse = await fetch(
                  `/api/food/search?q=${encodeURIComponent(food.name)}&limit=1`
                );
                const searchData = await searchResponse.json();

                if (searchData.foods && searchData.foods.length > 0) {
                  const dbFood = searchData.foods[0];
                  return {
                    ...food,
                    id: dbFood.id || Math.random().toString(36),
                    // Use database data if available, fallback to AI estimates
                    calories: dbFood.calories || food.calories,
                    protein: dbFood.protein || food.protein,
                    carbs: dbFood.carbs || food.carbs,
                    fats: dbFood.fats || food.fats,
                    source: dbFood.id ? 'database' : 'ai_estimate',
                  };
                }
              } catch (error) {
                console.error('Food search error:', error);
              }

              return {
                ...food,
                id: Math.random().toString(36),
                source: 'ai_estimate',
              };
            })
          );

          return NextResponse.json({
            success: true,
            detectedFoods: enhancedFoods,
            model: 'gemini-vision',
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (geminiError) {
      console.log('Gemini vision failed, trying OpenAI:', geminiError);

      // Fallback to OpenAI GPT-4 Vision
      try {
        const openaiResponse = await apiManager.openai.analyzeImage(image, prompt);

        if (openaiResponse && openaiResponse.choices) {
          const responseText = openaiResponse.choices[0].message.content;
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);

          if (jsonMatch) {
            const detectedFoods = JSON.parse(jsonMatch[0]);

            return NextResponse.json({
              success: true,
              detectedFoods: detectedFoods.map((food: any) => ({
                ...food,
                id: Math.random().toString(36),
                source: 'ai_estimate',
              })),
              model: 'gpt-4-vision',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (openaiError) {
        console.error('OpenAI vision also failed:', openaiError);
      }
    }

    // If all AI models fail, return error
    return NextResponse.json(
      {
        error: 'Could not analyze food image',
        message: 'Please try again or enter food manually',
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Food photo analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze food photo',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
