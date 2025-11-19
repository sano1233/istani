import { NextRequest, NextResponse } from 'next/server';
import { apiManager } from '@/lib/api-integrations';
import { createClient } from '@/lib/supabase/server';

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
    const { topic, type = 'general', includeReferences = true } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'exercise':
        result = await apiManager.perplexity.researchFitnessExercise(topic);
        break;

      case 'nutrition':
        result = await apiManager.perplexity.researchNutrition(topic);
        break;

      case 'workout-plan':
        const { goals, experience, equipment } = body;
        if (!goals || !experience || !equipment) {
          return NextResponse.json(
            { error: 'goals, experience, and equipment are required for workout-plan type' },
            { status: 400 }
          );
        }
        result = await apiManager.perplexity.generateWorkoutResearch({
          goals,
          experience,
          equipment,
        });
        break;

      case 'general':
      default:
        result = await apiManager.perplexity.chat([
          { role: 'system', content: 'You are a fitness and nutrition expert providing evidence-based guidance.' },
          { role: 'user', content: topic }
        ], { model: 'llama-3.1-sonar-small-128k-online' });
        break;
    }

    // Extract content from Perplexity response
    const content = result.choices?.[0]?.message?.content || 'No response';
    const citations = result.citations || [];

    return NextResponse.json({
      success: true,
      content,
      citations: includeReferences ? citations : [],
      model: result.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Research API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform research',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
