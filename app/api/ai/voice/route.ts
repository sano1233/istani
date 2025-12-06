import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { synthesizeVoice, getAvailableVoices, generateCoachingAudio } from '@/lib/ai-providers';

/**
 * Voice Synthesis API using Eleven Labs
 * POST /api/ai/voice - Generate speech from text
 * GET /api/ai/voice - Get available voices
 */

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: In Next.js 15, headers() must be awaited
    const headerList = await headers();
    const contentType = headerList.get('content-type');

    // Check if Eleven Labs is configured
    if (!process.env.ELEVEN_LABS_API_KEY) {
      return NextResponse.json(
        {
          error: 'Voice synthesis not configured',
          hint: 'Please set ELEVEN_LABS_API_KEY environment variable',
        },
        { status: 500 },
      );
    }

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, voiceId, type } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    let audioBuffer: ArrayBuffer | null = null;

    if (type === 'coaching') {
      // Use AI to enhance the message before speaking
      audioBuffer = await generateCoachingAudio(text);
    } else {
      // Direct text-to-speech
      audioBuffer = await synthesizeVoice({
        text,
        voiceId,
      });
    }

    if (!audioBuffer) {
      return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }

    // Return audio as base64 for easy client-side handling
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      format: 'mp3',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Voice synthesis error:', errorMessage);

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/ai/voice - Get available voices and status
 */
export async function GET() {
  const isConfigured = !!process.env.ELEVEN_LABS_API_KEY;

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      voices: [],
      hint: 'Set ELEVEN_LABS_API_KEY to enable voice synthesis',
    });
  }

  const voices = await getAvailableVoices();

  return NextResponse.json({
    configured: true,
    voices: voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
      labels: v.labels,
    })),
    default_voice: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  });
}
