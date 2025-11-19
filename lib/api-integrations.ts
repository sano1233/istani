/**
 * Unified API Integration Library
 *
 * Centralized management for all external API integrations
 * Used across the istani.org platform
 */

// Supabase Client (already configured)
export { createClient } from './supabase/client';
export { createClient as createServerClient } from './supabase/server';

// GitHub API Integration
export class GitHubAPI {
  private token: string;
  private baseURL = 'https://api.github.com';

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || '';
  }

  async getUserRepos(username: string) {
    const response = await fetch(`${this.baseURL}/users/${username}/repos`, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.json();
  }

  async getRepoStats(owner: string, repo: string) {
    const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.json();
  }
}

// Pexels API Integration
export class PexelsAPI {
  private apiKey: string;
  private baseURL = 'https://api.pexels.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PEXELS_API_KEY || '';
  }

  async searchPhotos(query: string, perPage = 15) {
    const response = await fetch(
      `${this.baseURL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          Authorization: this.apiKey,
        },
      },
    );
    return response.json();
  }

  async getCuratedPhotos(perPage = 15) {
    const response = await fetch(`${this.baseURL}/curated?per_page=${perPage}`, {
      headers: {
        Authorization: this.apiKey,
      },
    });
    return response.json();
  }

  async getPhoto(id: string) {
    const response = await fetch(`${this.baseURL}/photos/${id}`, {
      headers: {
        Authorization: this.apiKey,
      },
    });
    return response.json();
  }
}

// Unsplash API Integration
export class UnsplashAPI {
  private accessKey: string;
  private baseURL = 'https://api.unsplash.com';

  constructor(accessKey?: string) {
    this.accessKey = accessKey || process.env.UNSPLASH_ACCESS_KEY || '';
  }

  async searchPhotos(query: string, perPage = 15) {
    const response = await fetch(
      `${this.baseURL}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      },
    );
    return response.json();
  }

  async getRandomPhotos(count = 10, query?: string) {
    const url = query
      ? `${this.baseURL}/photos/random?count=${count}&query=${encodeURIComponent(query)}`
      : `${this.baseURL}/photos/random?count=${count}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${this.accessKey}`,
      },
    });
    return response.json();
  }
}

// OpenAI API Integration
export class OpenAIAPI {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async generateWorkoutPlan(userProfile: {
    goals: string[];
    experience: string;
    equipment: string[];
    timeAvailable: number;
  }) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert fitness coach. Generate personalized workout plans based on user goals, experience level, available equipment, and time constraints.',
          },
          {
            role: 'user',
            content: `Create a workout plan for: Goals: ${userProfile.goals.join(', ')}, Experience: ${userProfile.experience}, Equipment: ${userProfile.equipment.join(', ')}, Time: ${userProfile.timeAvailable} minutes per session.`,
          },
        ],
        temperature: 0.7,
      }),
    });
    return response.json();
  }

  async generateMealPlan(userProfile: {
    goals: string[];
    dietaryRestrictions: string[];
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
  }) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a nutritionist. Generate personalized meal plans based on user goals, dietary restrictions, calorie needs, and macro targets.',
          },
          {
            role: 'user',
            content: `Create a meal plan for: Goals: ${userProfile.goals.join(', ')}, Restrictions: ${userProfile.dietaryRestrictions.join(', ')}, Calories: ${userProfile.calories}, Macros: Protein ${userProfile.macros.protein}g, Carbs ${userProfile.macros.carbs}g, Fats ${userProfile.macros.fats}g.`,
          },
        ],
        temperature: 0.7,
      }),
    });
    return response.json();
  }

  async analyzeProgress(data: { workouts: any[]; nutrition: any[]; measurements: any[] }) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a fitness coach analyzing user progress. Provide insights, recommendations, and motivation based on their data.',
          },
          {
            role: 'user',
            content: `Analyze this progress data: ${JSON.stringify(data)}`,
          },
        ],
        temperature: 0.7,
      }),
    });
    return response.json();
  }

  async generateImage(prompt: string, options?: { size?: string; quality?: string; n?: number }) {
    const response = await fetch(`${this.baseURL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        n: options?.n || 1,
      }),
    });
    return response.json();
  }

  async generateSpeech(text: string, options?: { voice?: string; model?: string }) {
    const response = await fetch(`${this.baseURL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'tts-1',
        voice: options?.voice || 'alloy',
        input: text,
      }),
    });
    return response;
  }

  async transcribeAudio(audioFile: File) {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');

    const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });
    return response.json();
  }
}

// Google Gemini API Integration
export class GeminiAPI {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  async generateContent(prompt: string, options?: { model?: string; temperature?: number }) {
    const model = options?.model || 'gemini-pro';
    const response = await fetch(`${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });
    return response.json();
  }

  async generateWorkoutPlan(userProfile: {
    goals: string[];
    experience: string;
    equipment: string[];
    timeAvailable: number;
  }) {
    const prompt = `You are an expert fitness coach. Create a personalized workout plan for:
Goals: ${userProfile.goals.join(', ')}
Experience: ${userProfile.experience}
Equipment: ${userProfile.equipment.join(', ')}
Time: ${userProfile.timeAvailable} minutes per session

Generate a detailed weekly workout plan with specific exercises, sets, reps, and rest periods.`;

    return this.generateContent(prompt);
  }

  async generateMealPlan(userProfile: {
    goals: string[];
    dietaryRestrictions: string[];
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
  }) {
    const prompt = `You are a nutritionist. Create a personalized meal plan for:
Goals: ${userProfile.goals.join(', ')}
Restrictions: ${userProfile.dietaryRestrictions.join(', ')}
Calories: ${userProfile.calories}
Macros: Protein ${userProfile.macros.protein}g, Carbs ${userProfile.macros.carbs}g, Fats ${userProfile.macros.fats}g

Generate a detailed daily meal plan with specific meals, portions, and nutritional breakdown.`;

    return this.generateContent(prompt);
  }

  async analyzeImage(imageData: string, prompt: string) {
    const response = await fetch(
      `${this.baseURL}/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageData,
                  },
                },
              ],
            },
          ],
        }),
      },
    );
    return response.json();
  }
}

// Anthropic Claude API Integration
export class ClaudeAPI {
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  async generateContent(prompt: string, options?: { model?: string; temperature?: number }) {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: options?.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
    return response.json();
  }

  async generateWorkoutPlan(userProfile: {
    goals: string[];
    experience: string;
    equipment: string[];
    timeAvailable: number;
  }) {
    const prompt = `You are an expert fitness coach. Create a personalized workout plan for:
Goals: ${userProfile.goals.join(', ')}
Experience: ${userProfile.experience}
Equipment: ${userProfile.equipment.join(', ')}
Time: ${userProfile.timeAvailable} minutes per session

Generate a detailed weekly workout plan with specific exercises, sets, reps, rest periods, and form cues.`;

    return this.generateContent(prompt);
  }

  async generateMealPlan(userProfile: {
    goals: string[];
    dietaryRestrictions: string[];
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
  }) {
    const prompt = `You are a nutritionist. Create a personalized meal plan for:
Goals: ${userProfile.goals.join(', ')}
Restrictions: ${userProfile.dietaryRestrictions.join(', ')}
Calories: ${userProfile.calories}
Macros: Protein ${userProfile.macros.protein}g, Carbs ${userProfile.macros.carbs}g, Fats ${userProfile.macros.fats}g

Generate a detailed daily meal plan with recipes, portions, and nutritional breakdown.`;

    return this.generateContent(prompt);
  }

  async analyzeProgress(data: { workouts: any[]; nutrition: any[]; measurements: any[] }) {
    const prompt = `You are a fitness coach analyzing user progress. Provide detailed insights, recommendations, and motivation based on this data:

${JSON.stringify(data, null, 2)}

Analyze trends, identify areas for improvement, celebrate wins, and provide actionable next steps.`;

    return this.generateContent(prompt);
  }
}

// Qwen (Alibaba Cloud) API Integration
export class QwenAPI {
  private apiKey: string;
  private baseURL = 'https://dashscope.aliyuncs.com/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.QWEN_API_KEY || '';
  }

  async generateContent(prompt: string, options?: { model?: string; temperature?: number }) {
    const model = options?.model || 'qwen-turbo';
    const response = await fetch(`${this.baseURL}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: {
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        parameters: {
          temperature: options?.temperature || 0.7,
          top_p: 0.8,
          max_tokens: 2000,
        },
      }),
    });
    return response.json();
  }

  async generateWorkoutPlan(userProfile: {
    goals: string[];
    experience: string;
    equipment: string[];
    timeAvailable: number;
  }) {
    const prompt = `You are an expert fitness coach. Create a personalized workout plan for:
Goals: ${userProfile.goals.join(', ')}
Experience: ${userProfile.experience}
Equipment: ${userProfile.equipment.join(', ')}
Time: ${userProfile.timeAvailable} minutes per session

Generate a detailed weekly workout plan with exercises, sets, reps, and rest periods.`;

    return this.generateContent(prompt);
  }

  async generateMealPlan(userProfile: {
    goals: string[];
    dietaryRestrictions: string[];
    calories: number;
    macros: { protein: number; carbs: number; fats: number };
  }) {
    const prompt = `You are a nutritionist. Create a personalized meal plan for:
Goals: ${userProfile.goals.join(', ')}
Restrictions: ${userProfile.dietaryRestrictions.join(', ')}
Calories: ${userProfile.calories}
Macros: Protein ${userProfile.macros.protein}g, Carbs ${userProfile.macros.carbs}g, Fats ${userProfile.macros.fats}g

Generate a detailed daily meal plan with recipes and nutritional breakdown.`;

    return this.generateContent(prompt);
  }

  async analyzeProgress(data: { workouts: any[]; nutrition: any[]; measurements: any[] }) {
    const prompt = `You are a fitness coach analyzing user progress. Provide insights and recommendations based on this data:

${JSON.stringify(data, null, 2)}

Analyze trends, identify improvements, and provide actionable next steps.`;

    return this.generateContent(prompt);
  }
}

// ElevenLabs API Integration
export class ElevenLabsAPI {
  private apiKey: string;
  private baseURL = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  async generateSpeech(
    text: string,
    options?: {
      voiceId?: string;
      modelId?: string;
      stability?: number;
      similarityBoost?: number;
    },
  ) {
    const voiceId = options?.voiceId || '21m00Tcm4TlvDq8ikWAM';
    const response = await fetch(`${this.baseURL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: options?.modelId || 'eleven_monolingual_v1',
        voice_settings: {
          stability: options?.stability || 0.5,
          similarity_boost: options?.similarityBoost || 0.75,
        },
      }),
    });
    return response;
  }

  async getVoices() {
    const response = await fetch(`${this.baseURL}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });
    return response.json();
  }

  async generateCoachingAudio(message: string, voiceId?: string) {
    return this.generateSpeech(message, {
      voiceId: voiceId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
      stability: 0.6,
      similarityBoost: 0.8,
    });
  }
}

// USDA Food Data API Integration
export class USDAAPI {
  private apiKey: string;
  private baseURL = 'https://api.nal.usda.gov/fdc/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.USDA_API_KEY || '';
  }

  async searchFoods(query: string, pageSize = 50) {
    const response = await fetch(
      `${this.baseURL}/foods/search?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          pageSize,
        }),
      },
    );
    return response.json();
  }

  async getFoodDetails(fdcId: string) {
    const response = await fetch(`${this.baseURL}/food/${fdcId}?api_key=${this.apiKey}`);
    return response.json();
  }

  async getFoodsByIds(fdcIds: string[]) {
    const response = await fetch(`${this.baseURL}/foods?api_key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fdcIds }),
    });
    return response.json();
  }
}

// OpenFoodFacts API (Barcode Scanner)
export class OpenFoodFactsAPI {
  private baseURL = 'https://world.openfoodfacts.org/api/v2';

  async getProductByBarcode(barcode: string) {
    const response = await fetch(`${this.baseURL}/product/${barcode}.json`);
    return response.json();
  }

  async searchProducts(query: string, pageSize = 20) {
    const response = await fetch(
      `${this.baseURL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=${pageSize}&json=true`,
    );
    return response.json();
  }
}

// Perplexity AI - Research & Knowledge Base
export class PerplexityAPI {
  private apiKey: string;
  private baseURL = 'https://api.perplexity.ai';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || '';
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const model = options?.model || 'llama-3.1-sonar-small-128k-online';

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature || 0.2,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    return response.json();
  }

  async researchFitnessExercise(exerciseName: string) {
    const prompt = `Research the exercise "${exerciseName}" and provide:
1. Proper form and technique
2. Muscles targeted
3. Common mistakes to avoid
4. Safety precautions
5. Variations for different skill levels

Provide evidence-based information with recent sources.`;

    return this.chat([
      { role: 'system', content: 'You are a certified fitness expert providing accurate, evidence-based exercise information.' },
      { role: 'user', content: prompt }
    ]);
  }

  async researchNutrition(topic: string) {
    const prompt = `Provide evidence-based nutrition information about: ${topic}

Include:
1. Latest scientific research
2. Health benefits
3. Recommended intake
4. Potential risks
5. Food sources

Use only peer-reviewed sources from 2023-2025.`;

    return this.chat([
      { role: 'system', content: 'You are a registered dietitian providing evidence-based nutrition guidance.' },
      { role: 'user', content: prompt }
    ]);
  }

  async generateWorkoutResearch(userProfile: {
    goals: string[];
    experience: string;
    equipment: string[];
  }) {
    const prompt = `Research-backed workout plan for:
Goals: ${userProfile.goals.join(', ')}
Experience: ${userProfile.experience}
Equipment: ${userProfile.equipment.join(', ')}

Provide:
1. Exercise selection based on latest exercise science
2. Sets, reps, and rest periods backed by research
3. Progressive overload strategy
4. Recovery recommendations
5. Scientific references

Use evidence from sports science journals (2023-2025).`;

    return this.chat([
      { role: 'system', content: 'You are an exercise physiologist creating evidence-based training programs.' },
      { role: 'user', content: prompt }
    ], { model: 'llama-3.1-sonar-large-128k-online', maxTokens: 4000 });
  }

  async healthCheck(): Promise<{ status: string; model?: string }> {
    try {
      const response = await this.chat([
        { role: 'user', content: 'Hello' }
      ], { maxTokens: 10 });

      return {
        status: response.choices ? 'ok' : 'error',
        model: response.model
      };
    } catch (error) {
      return { status: 'error' };
    }
  }
}

// Unified API Manager
export class APIManager {
  public github: GitHubAPI;
  public pexels: PexelsAPI;
  public unsplash: UnsplashAPI;
  public openai: OpenAIAPI;
  public gemini: GeminiAPI;
  public claude: ClaudeAPI;
  public qwen: QwenAPI;
  public perplexity: PerplexityAPI;
  public elevenlabs: ElevenLabsAPI;
  public usda: USDAAPI;
  public openFoodFacts: OpenFoodFactsAPI;

  constructor() {
    this.github = new GitHubAPI();
    this.pexels = new PexelsAPI();
    this.unsplash = new UnsplashAPI();
    this.openai = new OpenAIAPI();
    this.gemini = new GeminiAPI();
    this.claude = new ClaudeAPI();
    this.qwen = new QwenAPI();
    this.perplexity = new PerplexityAPI();
    this.elevenlabs = new ElevenLabsAPI();
    this.usda = new USDAAPI();
    this.openFoodFacts = new OpenFoodFactsAPI();
  }

  // Multi-AI provider fallback for workout plans
  async generateWorkoutPlan(
    userProfile: {
      goals: string[];
      experience: string;
      equipment: string[];
      timeAvailable: number;
    },
    preferredProvider?: 'openai' | 'gemini' | 'claude' | 'qwen',
  ) {
    const providers = preferredProvider
      ? [preferredProvider, 'qwen', 'gemini', 'openai', 'claude'].filter((p, i, arr) => arr.indexOf(p) === i)
      : ['qwen', 'gemini', 'openai', 'claude'];

    for (const provider of providers) {
      try {
        if (provider === 'qwen' && process.env.QWEN_API_KEY) {
          return await this.qwen.generateWorkoutPlan(userProfile);
        } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
          return await this.openai.generateWorkoutPlan(userProfile);
        } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
          return await this.gemini.generateWorkoutPlan(userProfile);
        } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
          return await this.claude.generateWorkoutPlan(userProfile);
        }
      } catch (error) {
        console.error(`Failed to generate workout plan with ${provider}:`, error);
        continue;
      }
    }

    throw new Error('All AI providers failed or no API keys configured');
  }

  // Multi-AI provider fallback for meal plans
  async generateMealPlan(
    userProfile: {
      goals: string[];
      dietaryRestrictions: string[];
      calories: number;
      macros: { protein: number; carbs: number; fats: number };
    },
    preferredProvider?: 'openai' | 'gemini' | 'claude' | 'qwen',
  ) {
    const providers = preferredProvider
      ? [preferredProvider, 'qwen', 'gemini', 'openai', 'claude'].filter((p, i, arr) => arr.indexOf(p) === i)
      : ['qwen', 'gemini', 'openai', 'claude'];

    for (const provider of providers) {
      try {
        if (provider === 'qwen' && process.env.QWEN_API_KEY) {
          return await this.qwen.generateMealPlan(userProfile);
        } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
          return await this.openai.generateMealPlan(userProfile);
        } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
          return await this.gemini.generateMealPlan(userProfile);
        } else if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
          return await this.claude.generateMealPlan(userProfile);
        }
      } catch (error) {
        console.error(`Failed to generate meal plan with ${provider}:`, error);
        continue;
      }
    }

    throw new Error('All AI providers failed or no API keys configured');
  }

  // Generate motivational coaching audio
  async generateCoachingAudio(message: string, provider?: 'openai' | 'elevenlabs') {
    if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
      return await this.elevenlabs.generateCoachingAudio(message);
    } else if (process.env.OPENAI_API_KEY) {
      return await this.openai.generateSpeech(message, { voice: 'nova' });
    } else if (process.env.ELEVENLABS_API_KEY) {
      return await this.elevenlabs.generateCoachingAudio(message);
    }

    throw new Error('No speech generation API configured');
  }

  // Generate workout illustration images
  async generateWorkoutImage(description: string) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    return await this.openai.generateImage(
      `Professional fitness photography style: ${description}. High quality, well-lit gym environment, proper form demonstration.`,
      { quality: 'standard', size: '1024x1024' },
    );
  }

  // Health check for all APIs
  async healthCheck() {
    const results: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

    // Check GitHub
    try {
      if (process.env.GITHUB_TOKEN) {
        await this.github.getRepoStats('sano1233', 'istani');
        results.github = { status: 'ok' };
      } else {
        results.github = { status: 'error', message: 'No token configured' };
      }
    } catch (error: any) {
      results.github = { status: 'error', message: error.message };
    }

    // Check Pexels
    try {
      if (process.env.PEXELS_API_KEY) {
        await this.pexels.getCuratedPhotos(1);
        results.pexels = { status: 'ok' };
      } else {
        results.pexels = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.pexels = { status: 'error', message: error.message };
    }

    // Check Unsplash
    try {
      if (process.env.UNSPLASH_ACCESS_KEY) {
        await this.unsplash.getRandomPhotos(1);
        results.unsplash = { status: 'ok' };
      } else {
        results.unsplash = { status: 'error', message: 'No access key configured' };
      }
    } catch (error: any) {
      results.unsplash = { status: 'error', message: error.message };
    }

    // Check OpenAI
    try {
      if (process.env.OPENAI_API_KEY) {
        results.openai = { status: 'ok' };
      } else {
        results.openai = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.openai = { status: 'error', message: error.message };
    }

    // Check Gemini
    try {
      if (process.env.GEMINI_API_KEY) {
        results.gemini = { status: 'ok' };
      } else {
        results.gemini = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.gemini = { status: 'error', message: error.message };
    }

    // Check Claude
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        results.claude = { status: 'ok' };
      } else {
        results.claude = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.claude = { status: 'error', message: error.message };
    }

    // Check Qwen
    try {
      if (process.env.QWEN_API_KEY) {
        results.qwen = { status: 'ok' };
      } else {
        results.qwen = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.qwen = { status: 'error', message: error.message };
    }

    // Check Perplexity
    try {
      if (process.env.PERPLEXITY_API_KEY) {
        const perplexityHealth = await this.perplexity.healthCheck();
        results.perplexity = {
          status: perplexityHealth.status === 'ok' ? 'ok' : 'error',
          message: perplexityHealth.model || undefined,
        };
      } else {
        results.perplexity = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.perplexity = { status: 'error', message: error.message };
    }

    // Check ElevenLabs
    try {
      if (process.env.ELEVENLABS_API_KEY) {
        results.elevenlabs = { status: 'ok' };
      } else {
        results.elevenlabs = { status: 'error', message: 'No API key configured' };
      }
    } catch (error: any) {
      results.elevenlabs = { status: 'error', message: error.message };
    }

    // OpenFoodFacts doesn't require auth
    results.openFoodFacts = { status: 'ok' };

    return results;
  }
}

// Export singleton instance
export const apiManager = new APIManager();
