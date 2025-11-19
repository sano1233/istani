import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiManager } from '@/lib/api-integrations';

export const runtime = 'edge';

const VOICE_MAPPINGS: Record<string, string> = {
  motivational: '21m00Tcm4TlvDq8ikWAM', // Rachel - energetic
  calm: 'AZnzlk1XvdvUeBnXmlld', // Domi - calm
  professional: 'EXAVITQu4vr4xnSDxMaL', // Bella - professional
};

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
    const { text, voiceType = 'motivational' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Get the voice ID for the selected voice type
    const voiceId = VOICE_MAPPINGS[voiceType] || VOICE_MAPPINGS.motivational;

    try {
      // Try ElevenLabs first (best quality)
      const audioResponse = await apiManager.elevenlabs.generateCoachingAudio(text, voiceId);

      if (!audioResponse.ok) {
        throw new Error(`ElevenLabs API error: ${audioResponse.status}`);
      }

      // Track usage
      try {
        await supabase.from('voice_coaching_usage').insert({
          user_id: user.id,
          text_length: text.length,
          voice_type: voiceType,
          created_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('Failed to track usage:', dbError);
        // Don't fail the request if tracking fails
      }

      // Return the audio file
      const audioBuffer = await audioResponse.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
        },
      });
    } catch (elevenlabsError) {
      console.log('ElevenLabs failed, trying OpenAI:', elevenlabsError);

      // Fallback to OpenAI TTS
      try {
        const openaiResponse = await apiManager.openai.generateSpeech(text, {
          voice: voiceType === 'motivational' ? 'nova' : voiceType === 'calm' ? 'alloy' : 'echo',
          model: 'tts-1',
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const audioBuffer = await openaiResponse.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
          },
        });
      } catch (openaiError) {
        console.error('OpenAI TTS also failed:', openaiError);

        return NextResponse.json(
          {
            error: 'Failed to generate voice guidance',
            message: 'Both ElevenLabs and OpenAI TTS are unavailable',
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Voice coaching error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate voice coaching',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available voices
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Get available voices from ElevenLabs
      const voices = await apiManager.elevenlabs.getVoices();

      return NextResponse.json({
        success: true,
        voices: voices.voices || [],
        predefinedVoices: [
          {
            id: 'motivational',
            name: 'Motivational Coach',
            description: 'Energetic and encouraging',
            voice_id: VOICE_MAPPINGS.motivational,
          },
          {
            id: 'calm',
            name: 'Calm Instructor',
            description: 'Soothing and focused',
            voice_id: VOICE_MAPPINGS.calm,
          },
          {
            id: 'professional',
            name: 'Professional Trainer',
            description: 'Direct and technical',
            voice_id: VOICE_MAPPINGS.professional,
          },
        ],
      });
    } catch (error) {
      // Return predefined voices if ElevenLabs is unavailable
      return NextResponse.json({
        success: true,
        voices: [],
        predefinedVoices: [
          {
            id: 'motivational',
            name: 'Motivational Coach',
            description: 'Energetic and encouraging (OpenAI: Nova)',
          },
          {
            id: 'calm',
            name: 'Calm Instructor',
            description: 'Soothing and focused (OpenAI: Alloy)',
          },
          {
            id: 'professional',
            name: 'Professional Trainer',
            description: 'Direct and technical (OpenAI: Echo)',
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('Get voices error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get available voices',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
