import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.0-flash-exp'),
    messages: convertToCoreMessages(messages),
    system: `You are an enterprise AI assistant with advanced capabilities.

You help users with:
- Complex problem solving
- Code generation and analysis
- Research and information retrieval
- Creative tasks
- Technical assistance

Be helpful, accurate, and professional.`,
  });

  return result.toDataStreamResponse();
}
