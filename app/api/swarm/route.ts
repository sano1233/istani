import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
/**
 * Forwards a posted `prompt` and optional `X-OpenRouter-Key` / `X-Gemini-Key` headers to the backend swarm endpoint and returns the backend's streaming response.
 *
 * @param req - Incoming request whose JSON body must contain a `prompt` string; may include `X-OpenRouter-Key` and `X-Gemini-Key` headers that will be forwarded to the backend.
 * @returns A NextResponse whose body is the backend response stream and whose `Content-Type` header is `text/event-stream`.
 */
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