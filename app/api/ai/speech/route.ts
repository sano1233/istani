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
    const { text, provider = 'elevenlabs', voice, type = 'coaching' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    let enhancedText = text;

    if (type === 'coaching') {
      enhancedText = `${text}`;
    } else if (type === 'workout') {
      enhancedText = `Workout instruction: ${text}`;
    } else if (type === 'motivation') {
      enhancedText = `Motivational message: ${text}`;
    }

    let audioResponse;

    if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
      audioResponse = await apiManager.elevenlabs.generateCoachingAudio(enhancedText, voice);
    } else if (process.env.OPENAI_API_KEY) {
      audioResponse = await apiManager.openai.generateSpeech(enhancedText, { voice: voice || 'nova' });
    } else {
      return NextResponse.json(
        {
          error: 'No speech API configured',
          message: 'Please configure ELEVENLABS_API_KEY or OPENAI_API_KEY',
        },
        { status: 503 },
      );
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="coaching-${Date.now()}.mp3"`,
      },
    });
  } catch (error: any) {
    console.error('Speech generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate speech',
        message: error.message,
      },
      { status: 500 },
    );
  }
}
