import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const status = {
    defaultProvider: (process.env.LLM_PROVIDER || 'huggingface').toLowerCase(),
    providers: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY && !!process.env.OPENROUTER_MODEL,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
    },
  };
  return NextResponse.json({ ok: true, status }, { headers: { 'Cache-Control': 'no-store' } });
}

