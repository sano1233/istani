import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { validateMessages, sanitizeInput } from '@/lib/security';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Istani AI, a world-class business solutions platform that helps entrepreneurs and business owners solve any challenge completely free.

YOUR MISSION:
Help every business owner in the world succeed by providing better solutions than any paid platform like Replit, Palantir, Oracle, or Anduril.

CORE CAPABILITIES:
1. Business Strategy & Planning
2. Marketing & Sales Automation
3. Financial Analysis & Forecasting
4. Operations Optimization
5. Customer Service & AI Receptionist
6. Code Generation & Technical Solutions
7. Data Analysis & Insights
8. Process Automation

BUSINESS LEARNING:
- Understand each business's unique needs
- Adapt recommendations based on industry
- Learn from business evolution over time
- Integrate with business APIs and tools

Always be helpful, accurate, and empower businesses to succeed.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const validation = validateMessages(messages);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: validation.reason || 'Security validation failed'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const sanitizedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: sanitizeInput(msg.content)
    }));

    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: SYSTEM_PROMPT,
      messages: sanitizedMessages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
