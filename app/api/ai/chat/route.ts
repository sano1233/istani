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
    const { message, context, provider = 'openai', type = 'general' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let systemPrompt = 'You are a helpful AI assistant specializing in fitness and nutrition.';

    if (type === 'workout') {
      systemPrompt =
        'You are an expert fitness coach. Provide detailed, personalized workout advice based on proper form, progressive overload, and safety.';
    } else if (type === 'nutrition') {
      systemPrompt =
        'You are a certified nutritionist. Provide evidence-based nutrition advice, meal suggestions, and dietary guidance.';
    } else if (type === 'motivation') {
      systemPrompt =
        'You are a motivational fitness coach. Provide encouraging, inspiring messages that help users stay committed to their fitness goals.';
    } else if (type === 'progress') {
      systemPrompt =
        'You are a fitness analytics expert. Analyze user progress data and provide actionable insights and recommendations.';
    }

    const fullPrompt = context ? `${systemPrompt}\n\nContext: ${JSON.stringify(context)}\n\nUser: ${message}` : message;

    let result;

    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      result = await apiManager.openai.generateWorkoutPlan({
        goals: ['General fitness'],
        experience: 'intermediate',
        equipment: ['bodyweight'],
        timeAvailable: 30,
      });
    } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      result = await apiManager.gemini.generateContent(fullPrompt);
    } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
      result = await apiManager.claude.generateContent(fullPrompt);
    } else {
      return NextResponse.json(
        {
          error: 'Provider not configured',
          message: `${provider} API key not found`,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      response: result,
      provider,
      type,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        message: error.message,
      },
      { status: 500 },
    );
  }
}
