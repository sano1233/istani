type Provider = 'huggingface' | 'gemini' | 'claude' | 'openrouter';

interface GenerateTextOptions {
  provider: Provider;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  model?: string; // optional model override (used by openrouter)
}

// Lightweight helper to call different providers from the Edge runtime
export async function generateText({
  provider,
  prompt,
  maxTokens = 800,
  temperature = 0.7,
  topP = 0.9,
  model,
}: GenerateTextOptions): Promise<string> {
  switch (provider) {
    case 'gemini':
      return generateWithGemini({ prompt, maxTokens, temperature, topP });
    case 'claude':
      return generateWithClaude({ prompt, maxTokens, temperature, topP });
    case 'openrouter':
      return generateWithOpenRouter({ prompt, maxTokens, temperature, topP, model });
    case 'huggingface':
    default:
      return generateWithHuggingFace({ prompt, maxTokens, temperature, topP });
  }
}

async function generateWithGemini({
  prompt,
  maxTokens,
  temperature,
  topP,
}: {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
  }

  const model = process.env.GOOGLE_GEMINI_MODEL || 'models/gemini-1.5-flash';
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), Number(process.env.LLM_TIMEOUT_MS || 30000));
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          topP,
          maxOutputTokens: maxTokens,
        },
      }),
      signal: ctrl.signal,
    },
  );
  clearTimeout(timeout);

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini error: ${resp.status} ${text}`);
  }

  const data: any = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

async function generateWithClaude({
  prompt,
  maxTokens,
  temperature,
}: {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY');
  }

  const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), Number(process.env.LLM_TIMEOUT_MS || 30000));
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
    signal: ctrl.signal,
  });
  clearTimeout(timeout);

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Claude error: ${resp.status} ${text}`);
  }

  const data: any = await resp.json();
  const text: string = data?.content?.[0]?.text || '';
  return text;
}

async function generateWithOpenRouter({
  prompt,
  maxTokens,
  temperature,
  topP,
  model,
}: {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  model?: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }
  const chosenModel = model || process.env.OPENROUTER_MODEL;
  if (!chosenModel) {
    throw new Error('Missing OpenRouter model. Set OPENROUTER_MODEL or pass model.');
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), Number(process.env.LLM_TIMEOUT_MS || 30000));
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_HOME_URL || 'https://istani.store',
      'X-Title': 'Istani Fitness',
    },
    body: JSON.stringify({
      model: chosenModel,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
    }),
    signal: ctrl.signal,
  });
  clearTimeout(timeout);

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter error: ${resp.status} ${text}`);
  }
  const data: any = await resp.json();
  const text: string = data?.choices?.[0]?.message?.content || '';
  return text;
}

async function generateWithHuggingFace({
  prompt,
  maxTokens,
  temperature,
  topP,
}: {
  prompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}) {
  const { HfInference } = await import('@huggingface/inference');
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  const response = await hf.textGeneration({
    model,
    inputs: prompt,
    parameters: {
      max_new_tokens: maxTokens,
      temperature,
      top_p: topP,
    },
  });
  return (response as any).generated_text as string;
}

export function getProviderFromEnv(): Provider {
  const p = (process.env.LLM_PROVIDER || 'huggingface').toLowerCase();
  if (p === 'gemini' || p === 'claude' || p === 'huggingface') return p as Provider;
  return 'huggingface';
}
