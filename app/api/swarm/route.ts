import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const orKey = req.headers.get('X-OpenRouter-Key') || '';
  const gemKey = req.headers.get('X-Gemini-Key') || '';

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/swarm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-OpenRouter-Key': orKey, 'X-Gemini-Key': gemKey },
    body: JSON.stringify({ prompt })
  });
  return new NextResponse(res.body, { headers: { 'Content-Type': 'text/event-stream' } });
}
