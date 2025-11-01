import { NextRequest, NextResponse } from 'next/server';
import { agent } from '@/lib/autonomous/agent';
import { aiRateLimit, getClientIP } from '@/lib/security/rate-limit';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow longer for multi-AI analysis

const analyzeSchema = z.object({
  type: z.enum(['pr', 'issue', 'code']),
  data: z.object({
    title: z.string(),
    body: z.string().optional(),
    files: z
      .array(
        z.object({
          filename: z.string(),
          changes: z.string(),
        })
      )
      .optional(),
  }),
});

/**
 * Autonomous analysis endpoint
 * Analyzes PRs, issues, or code using multi-AI consensus
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const { success, limit, remaining, reset } = await aiRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Input validation
    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { type, data } = validation.data;

    let analysisResult;

    // Route to appropriate analyzer
    switch (type) {
      case 'pr':
        analysisResult = await agent.analyzePullRequest({
          title: data.title,
          body: data.body || '',
          files: data.files || [],
        });
        break;

      case 'issue':
        analysisResult = await agent.autoResolve({
          title: data.title,
          description: data.body || '',
          context: JSON.stringify(data.files || []),
        });
        break;

      case 'code':
        analysisResult = await agent.autoResolve({
          title: 'Code Review',
          description: data.body || '',
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        analysis: analysisResult,
      },
      {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Autonomous analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', message: error.message },
      { status: 500 }
    );
  }
}
