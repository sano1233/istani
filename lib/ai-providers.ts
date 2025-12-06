/**
 * Unified AI Provider Library
 *
 * Intelligently uses multiple AI providers with automatic fallback:
 * - Google Gemini (GEMINI_API_KEY)
 * - Alibaba Qwen (QWEN_API_KEY)
 * - OpenAI (OPENAI_API_KEY)
 * - OpenRouter (OPENROUTER_API_KEY)
 * - Eleven Labs for voice (ELEVEN_LABS_API_KEY)
 */

export type AIProvider = 'gemini' | 'qwen' | 'openai' | 'openrouter';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AICompletionOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

interface AICompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Get available AI providers based on configured environment variables
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];

  if (process.env.GEMINI_API_KEY) providers.push('gemini');
  if (process.env.QWEN_API_KEY) providers.push('qwen');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');

  return providers;
}

/**
 * Get the best available provider (prioritizes speed and cost)
 */
export function getBestProvider(): AIProvider | null {
  const providers = getAvailableProviders();

  // Priority: Gemini (fastest/free tier) > Qwen (fast) > OpenRouter (variety) > OpenAI (reliable)
  const priority: AIProvider[] = ['gemini', 'qwen', 'openrouter', 'openai'];

  for (const p of priority) {
    if (providers.includes(p)) return p;
  }

  return null;
}

/**
 * Gemini API Implementation
 */
async function callGemini(options: AICompletionOptions): Promise<AICompletionResult> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = options.model || 'gemini-1.5-flash';

  // Convert messages to Gemini format
  const contents = options.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Add system instruction if present
  const systemInstruction = options.messages.find((m) => m.role === 'system')?.content;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2048,
          responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain',
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    content,
    provider: 'gemini',
    model,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    },
  };
}

/**
 * Qwen API Implementation (Alibaba Cloud / DashScope)
 */
async function callQwen(options: AICompletionOptions): Promise<AICompletionResult> {
  const apiKey = process.env.QWEN_API_KEY!;
  const model = options.model || 'qwen-turbo';

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: {
        messages: options.messages,
      },
      parameters: {
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        result_format: options.responseFormat === 'json' ? 'message' : 'text',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qwen API error: ${error}`);
  }

  const data = await response.json();
  const content = data.output?.choices?.[0]?.message?.content || data.output?.text || '';

  return {
    content,
    provider: 'qwen',
    model,
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}

/**
 * OpenAI API Implementation
 */
async function callOpenAI(options: AICompletionOptions): Promise<AICompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const model = options.model || 'gpt-4o-mini';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    provider: 'openai',
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
  };
}

/**
 * OpenRouter API Implementation (supports many models)
 */
async function callOpenRouter(options: AICompletionOptions): Promise<AICompletionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY!;
  const model = options.model || 'google/gemini-flash-1.5';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://istani.org',
      'X-Title': 'Istani Fitness',
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    provider: 'openrouter',
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
  };
}

/**
 * Main AI completion function with automatic provider selection and fallback
 */
export async function createCompletion(
  options: AICompletionOptions,
  preferredProvider?: AIProvider,
): Promise<AICompletionResult> {
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error(
      'No AI providers configured. Please set one of: GEMINI_API_KEY, QWEN_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY',
    );
  }

  // Build provider order: preferred first, then by priority
  const providerOrder: AIProvider[] = [];

  if (preferredProvider && providers.includes(preferredProvider)) {
    providerOrder.push(preferredProvider);
  }

  // Add remaining providers by priority
  const priority: AIProvider[] = ['gemini', 'qwen', 'openrouter', 'openai'];
  for (const p of priority) {
    if (providers.includes(p) && !providerOrder.includes(p)) {
      providerOrder.push(p);
    }
  }

  // Try each provider until one succeeds
  let lastError: Error | null = null;

  for (const provider of providerOrder) {
    try {
      switch (provider) {
        case 'gemini':
          return await callGemini(options);
        case 'qwen':
          return await callQwen(options);
        case 'openai':
          return await callOpenAI(options);
        case 'openrouter':
          return await callOpenRouter(options);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Provider ${provider} failed:`, lastError.message);
      // Continue to next provider
    }
  }

  throw lastError || new Error('All AI providers failed');
}

/**
 * Generate a workout plan using AI
 */
export async function generateWorkoutPlan(params: {
  goals: string[];
  experience: string;
  equipment: string[];
  timeAvailable: number;
  daysPerWeek?: number;
}): Promise<any> {
  const systemPrompt = `You are an expert fitness coach following ACSM (American College of Sports Medicine) guidelines.
Generate evidence-based, safe workout plans. Output valid JSON only.`;

  const userPrompt = `Create a personalized ${params.daysPerWeek || 4}-day workout plan:
- Goals: ${params.goals.join(', ')}
- Experience: ${params.experience}
- Equipment: ${params.equipment.join(', ')}
- Time per session: ${params.timeAvailable} minutes

Output JSON format:
{
  "plan_name": "string",
  "description": "string",
  "workouts": [{
    "day": number,
    "name": "string",
    "exercises": [{
      "name": "string",
      "sets": number,
      "reps": "string",
      "rest_seconds": number,
      "notes": "string"
    }],
    "estimated_duration": number,
    "estimated_calories": number
  }],
  "progression_tips": ["string"],
  "safety_notes": ["string"]
}`;

  const result = await createCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    responseFormat: 'json',
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { raw: result.content, provider: result.provider };
  }
}

/**
 * Generate a meal plan using AI
 */
export async function generateMealPlan(params: {
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  dietaryRestrictions?: string[];
  goals?: string[];
}): Promise<any> {
  const systemPrompt = `You are a sports nutritionist following ISSN (International Society of Sports Nutrition) guidelines.
Generate evidence-based meal plans optimized for fitness goals. Output valid JSON only.
Key guidelines:
- Protein: 1.6-2.2g/kg bodyweight for muscle gain
- Meal timing: Distribute protein across 4-5 meals
- Prioritize whole foods over supplements`;

  const userPrompt = `Create a daily meal plan:
- Target calories: ${params.calories} kcal
- Target protein: ${params.protein}g
${params.carbs ? `- Target carbs: ${params.carbs}g` : ''}
${params.fats ? `- Target fats: ${params.fats}g` : ''}
${params.dietaryRestrictions?.length ? `- Restrictions: ${params.dietaryRestrictions.join(', ')}` : ''}
${params.goals?.length ? `- Goals: ${params.goals.join(', ')}` : ''}

Output JSON format:
{
  "meals": [{
    "name": "string",
    "time": "string",
    "foods": ["string"],
    "macros": {"protein": number, "carbs": number, "fats": number},
    "calories": number
  }],
  "totals": {"calories": number, "protein": number, "carbs": number, "fats": number},
  "tips": ["string"]
}`;

  const result = await createCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    responseFormat: 'json',
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { raw: result.content, provider: result.provider };
  }
}

/**
 * Analyze fitness progress using AI
 */
export async function analyzeProgress(data: {
  workouts: any[];
  measurements: any[];
  goals: string[];
}): Promise<any> {
  const systemPrompt = `You are a fitness analytics expert. Analyze user progress data and provide actionable insights.
Focus on trends, improvements, and areas needing attention. Be encouraging but honest.`;

  const userPrompt = `Analyze this fitness progress data:

Workouts (last 30 days): ${JSON.stringify(data.workouts.slice(0, 20))}
Body measurements: ${JSON.stringify(data.measurements.slice(0, 10))}
Goals: ${data.goals.join(', ')}

Provide analysis in JSON format:
{
  "summary": "string",
  "strengths": ["string"],
  "areas_to_improve": ["string"],
  "recommendations": ["string"],
  "motivation_message": "string",
  "estimated_goal_progress": number
}`;

  const result = await createCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    responseFormat: 'json',
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { raw: result.content, provider: result.provider };
  }
}

// ============================================================
// ELEVEN LABS VOICE SYNTHESIS
// ============================================================

interface VoiceSynthesisOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Generate speech from text using Eleven Labs
 */
export async function synthesizeVoice(options: VoiceSynthesisOptions): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;

  if (!apiKey) {
    console.error('ELEVEN_LABS_API_KEY not configured');
    return null;
  }

  const voiceId = options.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah
  const modelId = options.modelId || 'eleven_multilingual_v2';

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: modelId,
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Eleven Labs API error: ${error}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Voice synthesis failed:', error);
    return null;
  }
}

/**
 * Get available voices from Eleven Labs
 */
export async function getAvailableVoices(): Promise<any[]> {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.voices || [];
  } catch {
    return [];
  }
}

/**
 * Generate coaching audio message
 */
export async function generateCoachingAudio(message: string): Promise<ArrayBuffer | null> {
  // Use AI to make the message more conversational if needed
  const enhancedMessage = await createCompletion({
    messages: [
      {
        role: 'system',
        content:
          'You are a friendly fitness coach. Rewrite the following message to be warm, encouraging, and conversational. Keep it brief (under 100 words).',
      },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
  }).catch(() => ({ content: message, provider: 'fallback' as AIProvider, model: 'none' }));

  return synthesizeVoice({
    text: enhancedMessage.content,
    stability: 0.6,
    similarityBoost: 0.8,
  });
}

// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkAIProvidersHealth(): Promise<Record<string, { status: 'ok' | 'error'; message?: string }>> {
  const results: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

  // Check Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      await callGemini({
        messages: [{ role: 'user', content: 'Say "ok"' }],
        maxTokens: 10,
      });
      results.gemini = { status: 'ok' };
    } catch (e: any) {
      results.gemini = { status: 'error', message: e.message };
    }
  } else {
    results.gemini = { status: 'error', message: 'Not configured' };
  }

  // Check Qwen
  if (process.env.QWEN_API_KEY) {
    results.qwen = { status: 'ok' }; // Just check if configured
  } else {
    results.qwen = { status: 'error', message: 'Not configured' };
  }

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    results.openai = { status: 'ok' };
  } else {
    results.openai = { status: 'error', message: 'Not configured' };
  }

  // Check OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    results.openrouter = { status: 'ok' };
  } else {
    results.openrouter = { status: 'error', message: 'Not configured' };
  }

  // Check Eleven Labs
  if (process.env.ELEVEN_LABS_API_KEY) {
    results.elevenlabs = { status: 'ok' };
  } else {
    results.elevenlabs = { status: 'error', message: 'Not configured' };
  }

  return results;
}
