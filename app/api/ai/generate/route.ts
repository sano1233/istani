import { NextRequest, NextResponse } from 'next/server';
import { secureAI } from '@/lib/ai-security/defense';
import { aiRateLimit, getClientIP } from '@/lib/security/rate-limit';
import { verifyToken, extractTokenFromCookies } from '@/lib/security/jwt';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const generateSchema = z.object({
  prompt: z.string().min(1).max(4000),
  stream: z.boolean().optional(),
});

/**
 * Secure AI generation endpoint with all 5 security layers
 */
export async function POST(request: NextRequest) {
  try {
    // Layer 1: Rate limiting
    const ip = getClientIP(request);
    const { success, limit, remaining, reset } = await aiRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Layer 2: Authentication (optional - remove if public)
    const token = extractTokenFromCookies(request.headers.get('cookie'));
    const user = token ? await verifyToken(token) : null;

    // Layer 3: Input validation
    const body = await request.json();
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { prompt } = validation.data;

    // Layer 4: AI generation with comprehensive security
    const result = await secureAI.processQuery(prompt);

    // Layer 5: Response validation
    if (!result.securityStatus.passed) {
      return NextResponse.json(
        {
          error: 'Security check failed',
          details: result.securityStatus,
        },
        { status: 400 }
      );
    }

    // Layer 6: Confidence threshold enforcement
    if (result.confidence < 0.99) {
      return NextResponse.json({
        answer: null,
        reason: 'Low confidence',
        confidence: result.confidence,
      });
    }

    // Success response with rate limit headers
    return NextResponse.json(
      {
        answer: result.answer,
        confidence: result.confidence,
        processingTime: result.processingTime,
        userId: user?.userId,
      },
      {
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    );
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
