import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const maxDuration = 60;

interface FormCheckRequest {
  exercise_name: string;
  user_description: string; // User describes what they're doing
  common_mistakes?: string[]; // Optional: known issues with this exercise
  equipment?: string; // barbell, dumbbell, machine, etc.
  experience_level?: string; // beginner, intermediate, advanced
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

    const body: FormCheckRequest = await request.json();

    // Validate input
    if (!body.exercise_name || !body.user_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build prompt for AI
    const prompt = buildFormCheckPrompt(body);

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
              'You are an expert personal trainer and biomechanics specialist helping users perfect their exercise form. Provide detailed, actionable feedback with a focus on safety and effectiveness. Be encouraging but honest about form issues.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'Failed to analyze exercise form' }, { status: 500 });
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Log AI usage for analytics
    await supabase.from('ai_recommendations').insert({
      user_id: user.id,
      recommendation_type: 'form_check',
      title: `Form Check: ${body.exercise_name}`,
      description: analysis.summary || 'AI-generated form analysis',
      ai_model: 'gpt-4-turbo',
      confidence_score: analysis.confidence_score || 0.8,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing exercise form:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildFormCheckPrompt(request: FormCheckRequest): string {
  return `Analyze the exercise form for the following:

**Exercise:** ${request.exercise_name}
${request.equipment ? `**Equipment:** ${request.equipment}` : ''}
${request.experience_level ? `**User Experience Level:** ${request.experience_level}` : ''}

**User's Description of Their Form:**
"${request.user_description}"

${request.common_mistakes && request.common_mistakes.length > 0 ? `**Known Common Mistakes for This Exercise:**
${request.common_mistakes.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : ''}

Please provide a comprehensive form analysis in the following JSON format:
{
  "summary": "One sentence summary of overall form quality",
  "overall_rating": 7.5,  // 0-10 scale
  "confidence_score": 0.85,  // 0-1 how confident you are in this analysis
  "form_analysis": {
    "positive_aspects": [
      "What they're doing well (specific praise)"
    ],
    "areas_for_improvement": [
      {
        "issue": "Specific form issue identified",
        "severity": "minor|moderate|critical",
        "explanation": "Why this matters for safety/effectiveness",
        "correction": "Exactly how to fix it",
        "cue": "Simple mental cue to remember the correction"
      }
    ],
    "potential_injuries": [
      {
        "body_part": "shoulder|lower back|knee|etc",
        "risk_level": "low|moderate|high",
        "prevention": "How to prevent this injury"
      }
    ]
  },
  "detailed_breakdown": {
    "setup": {
      "assessment": "Analysis of starting position",
      "recommendations": ["Specific setup improvements"]
    },
    "execution": {
      "assessment": "Analysis of movement execution",
      "recommendations": ["Specific execution improvements"]
    },
    "breathing": {
      "assessment": "Breathing pattern analysis",
      "recommendations": ["Proper breathing technique"]
    },
    "tempo": {
      "assessment": "Movement speed analysis",
      "recommendations": ["Optimal tempo suggestions"]
    }
  },
  "progressive_cues": [
    {
      "level": "beginner",
      "cue": "Simple cue for learning the movement"
    },
    {
      "level": "intermediate",
      "cue": "More advanced cue for refinement"
    },
    {
      "level": "advanced",
      "cue": "Expert-level optimization cue"
    }
  ],
  "video_resources": [
    "Suggested search terms for finding good form videos"
  ],
  "alternatives": [
    {
      "exercise": "Alternative exercise name",
      "reason": "Why this might be better for the user",
      "when_to_use": "Situations where this alternative is appropriate"
    }
  ],
  "next_steps": [
    "Immediate action item 1",
    "Practice recommendation",
    "When to increase difficulty"
  ],
  "encouragement": "Motivational message based on their description"
}

IMPORTANT ANALYSIS GUIDELINES:
1. Be specific and actionable - avoid generic advice
2. Prioritize safety over performance
3. Consider the user's experience level
4. Identify the most critical issues first
5. Provide clear mental cues that are easy to remember
6. Be encouraging - fitness is a journey
7. If the description is unclear, note what additional information would help
8. Consider biomechanics and common compensation patterns
9. Suggest progressions or regressions as appropriate
10. If you suspect serious form issues, recommend getting in-person coaching

Make your analysis:
- Detailed and specific to their description
- Focused on safety first, then effectiveness
- Appropriate for their experience level
- Actionable with clear next steps
- Encouraging and supportive`;
}
