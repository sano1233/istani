import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiManager } from '@/lib/api-integrations';

// Using Node.js runtime for longer execution time needed for video processing
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for video analysis (Vercel limit)

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
    const { video, exercise } = body;

    if (!video || !exercise) {
      return NextResponse.json(
        { error: 'Video and exercise name are required' },
        { status: 400 }
      );
    }

    // Extract frames from video (in a real implementation, this would be done server-side)
    // For now, we'll use the video directly with Gemini Vision
    // Note: Gemini Vision can analyze video directly

    const prompt = `You are an expert personal trainer and biomechanics specialist analyzing a workout video.

Exercise: ${exercise}

Analyze this workout video and provide detailed form feedback:

1. Overall Form Score (0-100): Rate the overall execution quality
2. Aspect Analysis (each 0-100 with detailed feedback):
   - Posture: Spinal alignment, head position, overall body alignment
   - Range of Motion: Full ROM, proper depth/height, controlled movement
   - Tempo: Speed of execution, pause at key points, consistency
   - Stability: Balance, core engagement, unwanted movement

3. Form Corrections: Specific, actionable corrections needed
4. Injury Risks: Identify any movements that could lead to injury
5. Recommendations: Progressive improvements and tips

Format your response as JSON:
{
  "exercise": "${exercise}",
  "overallScore": number,
  "aspects": {
    "posture": {
      "score": number,
      "feedback": "detailed feedback string"
    },
    "range_of_motion": {
      "score": number,
      "feedback": "detailed feedback string"
    },
    "tempo": {
      "score": number,
      "feedback": "detailed feedback string"
    },
    "stability": {
      "score": number,
      "feedback": "detailed feedback string"
    }
  },
  "corrections": ["correction 1", "correction 2", ...],
  "injury_risks": ["risk 1", "risk 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "confidence": number
}

Be thorough, specific, and prioritize safety. If form is dangerous, clearly state the injury risks.`;

    let analysis;

    try {
      // Try Gemini Vision first (best for video analysis)
      const geminiResponse = await apiManager.gemini.analyzeImage(video, prompt);
      analysis = parseAIResponse(geminiResponse);
    } catch (geminiError) {
      console.log('Gemini vision failed, trying OpenAI:', geminiError);

      try {
        // Fallback to OpenAI GPT-4 Vision (works with video frames)
        const openaiResponse = await apiManager.openai.analyzeImage(video, prompt);
        analysis = parseAIResponse(openaiResponse);
      } catch (openaiError) {
        console.error('OpenAI vision also failed:', openaiError);

        // Provide fallback analysis
        analysis = {
          exercise,
          overallScore: 50,
          aspects: {
            posture: {
              score: 50,
              feedback: 'Unable to analyze - please ensure video is clear and exercise is visible',
            },
            range_of_motion: {
              score: 50,
              feedback: 'Unable to analyze - please ensure full range of motion is visible',
            },
            tempo: {
              score: 50,
              feedback: 'Unable to analyze - please provide a complete rep',
            },
            stability: {
              score: 50,
              feedback: 'Unable to analyze - ensure stable camera position',
            },
          },
          corrections: [
            'Unable to analyze form with AI. Please ensure good lighting and clear video.',
            'Try recording from the side or front with full body visible.',
            'Consider retaking the video with better angle.',
          ],
          injury_risks: ['Cannot assess injury risk - analysis failed'],
          recommendations: [
            'Retake video with better lighting and camera angle',
            'Ensure the entire movement is captured in frame',
            'Use a tripod or stable surface for camera',
          ],
          confidence: 20,
        };
      }
    }

    // Store the analysis in database
    try {
      await supabase.from('workout_form_analyses').insert({
        user_id: user.id,
        exercise_name: exercise,
        overall_score: analysis.overallScore,
        posture_score: analysis.aspects.posture.score,
        rom_score: analysis.aspects.range_of_motion.score,
        tempo_score: analysis.aspects.tempo.score,
        stability_score: analysis.aspects.stability.score,
        corrections: analysis.corrections,
        injury_risks: analysis.injury_risks,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence,
        analyzed_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to store form analysis:', dbError);
      // Don't fail the request if DB storage fails
    }

    return NextResponse.json({
      success: true,
      analysis,
      model: 'gemini-vision',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Workout form analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze workout form',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

function parseAIResponse(response: any): any {
  try {
    let jsonText = '';

    // Extract text from various AI response formats
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
    } else if (response.text) {
      // Direct text property
      jsonText = response.text;
    }

    // Try to extract JSON from markdown code blocks
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      // Validate required fields
      if (!parsed.overallScore || !parsed.aspects) {
        throw new Error('Missing required fields in response');
      }

      return parsed;
    }

    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response:', error);

    // Return fallback structure
    return {
      exercise: 'Unknown',
      overallScore: 50,
      aspects: {
        posture: {
          score: 50,
          feedback: 'Unable to analyze posture from video',
        },
        range_of_motion: {
          score: 50,
          feedback: 'Unable to analyze range of motion',
        },
        tempo: {
          score: 50,
          feedback: 'Unable to analyze tempo',
        },
        stability: {
          score: 50,
          feedback: 'Unable to analyze stability',
        },
      },
      corrections: ['Analysis incomplete - please retake video'],
      injury_risks: ['Cannot assess injury risk'],
      recommendations: [
        'Ensure good lighting and clear video quality',
        'Record from an angle that shows full body movement',
        'Use a stable camera position',
      ],
      confidence: 20,
    };
  }
}
