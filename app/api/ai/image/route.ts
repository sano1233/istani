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
    const { prompt, type = 'workout', size = '1024x1024', quality = 'standard' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let enhancedPrompt = prompt;

    if (type === 'workout') {
      enhancedPrompt = `Professional fitness photography style: ${prompt}. High quality, well-lit gym environment, proper form demonstration, athletic and motivational.`;
    } else if (type === 'meal') {
      enhancedPrompt = `Professional food photography style: ${prompt}. High quality, appetizing presentation, well-lit, nutritious and healthy meal.`;
    } else if (type === 'progress') {
      enhancedPrompt = `Fitness progress visualization: ${prompt}. Clean, modern design, motivational and inspiring.`;
    }

    const result = await apiManager.openai.generateImage(enhancedPrompt, { size, quality });

    return NextResponse.json({
      success: true,
      images: result.data,
      prompt: enhancedPrompt,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        message: error.message,
      },
      { status: 500 },
    );
  }
}
