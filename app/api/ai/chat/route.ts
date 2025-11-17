import { NextRequest, NextResponse } from 'next/server';
import { unifiedAI } from '@/lib/unified-ai-client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, provider, model, temperature, maxTokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Configure AI client with preferred provider if specified
    const aiClient = provider
      ? new (await import('@/lib/unified-ai-client')).UnifiedAIClient({
          preferredProvider: provider,
        })
      : unifiedAI;

    const response = await aiClient.chat(messages, {
      model,
      temperature,
      maxTokens,
    });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process AI request',
      },
      { status: 500 }
    );
  }
}
