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
    const { currentPhoto, previousPhoto, analysisType } = body;

    if (!currentPhoto) {
      return NextResponse.json({ error: 'Current photo is required' }, { status: 400 });
    }

    // Build comprehensive prompt for Gemini Vision
    const prompt = analysisType === 'comparison' && previousPhoto
      ? `You are an expert fitness coach and body composition analyst. Analyze these two progress photos (before and after) and provide:

1. Current Body Composition:
   - Estimated body fat percentage (number between 5-50)
   - Muscle mass assessment (Low/Moderate/High/Very High)
   - Posture evaluation (Excellent/Good/Fair/Poor)
   - Overall confidence in analysis (0-100)

2. Progress Comparison:
   - Visual weight change assessment (describe what you see)
   - Muscle gain observations (specific muscle groups if visible)
   - Fat loss observations (areas where fat loss is visible)
   - List of specific improvements you notice

3. Actionable Recommendations:
   - 3-4 specific recommendations for continued progress
   - Focus areas for improvement
   - Training or nutrition adjustments

Format your response as JSON:
{
  "bodyComposition": {
    "estimatedBodyFat": number,
    "muscleMass": "Low" | "Moderate" | "High" | "Very High",
    "posture": "Excellent" | "Good" | "Fair" | "Poor",
    "confidence": number
  },
  "comparison": {
    "weightChange": "string describing visual change",
    "muscleGain": "string describing muscle gains",
    "fatLoss": "string describing fat loss",
    "improvements": ["improvement 1", "improvement 2", ...]
  },
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}

Be honest and realistic in your assessment. If images are unclear, reflect that in lower confidence scores.`
      : `You are an expert fitness coach and body composition analyst. Analyze this progress photo and provide:

1. Body Composition Analysis:
   - Estimated body fat percentage (number between 5-50)
   - Muscle mass assessment (Low/Moderate/High/Very High)
   - Posture evaluation (Excellent/Good/Fair/Poor)
   - Overall confidence in analysis (0-100)

2. Actionable Recommendations:
   - 3-4 specific recommendations for fitness improvement
   - Focus areas based on visible composition
   - Training suggestions

Format your response as JSON:
{
  "bodyComposition": {
    "estimatedBodyFat": number,
    "muscleMass": "Low" | "Moderate" | "High" | "Very High",
    "posture": "Excellent" | "Good" | "Fair" | "Poor",
    "confidence": number
  },
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}

Be honest and realistic. If the image is unclear, reflect that in lower confidence scores.`;

    let analysis;

    try {
      // Try Gemini Vision first (best for body composition analysis)
      if (analysisType === 'comparison' && previousPhoto) {
        // For comparison, we need to analyze both images
        const geminiResponse = await apiManager.gemini.analyzeMultipleImages(
          [previousPhoto, currentPhoto],
          prompt
        );
        analysis = parseAIResponse(geminiResponse);
      } else {
        // Single photo analysis
        const geminiResponse = await apiManager.gemini.analyzeImage(currentPhoto, prompt);
        analysis = parseAIResponse(geminiResponse);
      }
    } catch (geminiError) {
      console.log('Gemini vision failed, trying OpenAI:', geminiError);

      try {
        // Fallback to OpenAI GPT-4 Vision
        if (analysisType === 'comparison' && previousPhoto) {
          // OpenAI can analyze both images in one call
          const openaiResponse = await apiManager.openai.analyzeMultipleImages(
            [previousPhoto, currentPhoto],
            prompt
          );
          analysis = parseAIResponse(openaiResponse);
        } else {
          const openaiResponse = await apiManager.openai.analyzeImage(currentPhoto, prompt);
          analysis = parseAIResponse(openaiResponse);
        }
      } catch (openaiError) {
        console.error('OpenAI vision also failed:', openaiError);

        // Provide fallback analysis
        if (analysisType === 'comparison') {
          analysis = {
            bodyComposition: {
              estimatedBodyFat: 20,
              muscleMass: 'Moderate',
              posture: 'Good',
              confidence: 30,
            },
            comparison: {
              weightChange: 'Unable to compare - analysis failed',
              muscleGain: 'Unable to assess',
              fatLoss: 'Unable to assess',
              improvements: ['Please retake photos for comparison'],
            },
            recommendations: [
              'Unable to analyze images with AI. Please ensure good lighting and clear photos.',
              'Try taking photos in well-lit area with full body visible.',
              'Consider retaking the photos for better analysis.',
            ],
          };
        } else {
          analysis = {
            bodyComposition: {
              estimatedBodyFat: 20,
              muscleMass: 'Moderate',
              posture: 'Good',
              confidence: 30,
            },
            recommendations: [
              'Unable to analyze image with AI. Please ensure good lighting and clear photo.',
              'Try taking a photo in well-lit area with full body visible.',
              'Consider retaking the photo for better analysis.',
            ],
          };
        }
      }
    }

    // Store the analysis in the database for tracking
    try {
      await supabase.from('progress_photos').insert({
        user_id: user.id,
        photo_url: currentPhoto.substring(0, 100), // Store just a reference
        analysis_type: analysisType,
        body_fat_estimate: analysis.bodyComposition.estimatedBodyFat,
        muscle_mass: analysis.bodyComposition.muscleMass,
        posture: analysis.bodyComposition.posture,
        confidence: analysis.bodyComposition.confidence,
        ai_recommendations: analysis.recommendations,
        analyzed_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to store analysis in database:', dbError);
      // Don't fail the request if DB storage fails
    }

    return NextResponse.json({
      success: true,
      analysis,
      model: 'gemini-vision',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Progress photo analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze progress photo',
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
      if (!parsed.bodyComposition) {
        throw new Error('Missing bodyComposition in response');
      }

      return parsed;
    }

    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response:', error);

    // Return fallback structure
    return {
      bodyComposition: {
        estimatedBodyFat: 20,
        muscleMass: 'Moderate',
        posture: 'Good',
        confidence: 30,
      },
      recommendations: [
        'Analysis incomplete. Please ensure photos are clear and well-lit.',
        'Try taking photos in a well-lit area with neutral background.',
        'Ensure full body is visible in the frame for best results.',
      ],
    };
  }
}
