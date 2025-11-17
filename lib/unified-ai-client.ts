/**
 * Unified AI Client
 * Intelligent routing between multiple AI services and APIs
 */

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface UnifiedAIConfig {
  preferredProvider?: 'openai' | 'anthropic' | 'elevenlabs' | 'openrouter' | 'ollama';
  fallbackProviders?: string[];
  maxRetries?: number;
}

export class UnifiedAIClient {
  private config: UnifiedAIConfig;

  constructor(config: UnifiedAIConfig = {}) {
    this.config = {
      preferredProvider: config.preferredProvider || 'anthropic',
      fallbackProviders: config.fallbackProviders || ['openai', 'openrouter', 'ollama'],
      maxRetries: config.maxRetries || 3,
    };
  }

  /**
   * Send a message to the AI with automatic provider selection and fallback
   */
  async chat(messages: AIMessage[], options: any = {}): Promise<AIResponse> {
    const providers = [this.config.preferredProvider, ...(this.config.fallbackProviders || [])];

    for (const provider of providers) {
      try {
        console.log(`Attempting AI request with provider: ${provider}`);
        const response = await this.sendToProvider(provider as string, messages, options);
        return response;
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        // Try next provider
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }

  /**
   * Send request to specific provider
   */
  private async sendToProvider(
    provider: string,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    switch (provider) {
      case 'openai':
        return await this.sendToOpenAI(messages, options);
      case 'anthropic':
        return await this.sendToAnthropic(messages, options);
      case 'elevenlabs':
        return await this.sendToElevenLabs(messages, options);
      case 'openrouter':
        return await this.sendToOpenRouter(messages, options);
      case 'ollama':
        return await this.sendToOllama(messages, options);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * OpenAI Integration
   */
  private async sendToOpenAI(messages: AIMessage[], options: any): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4-turbo-preview',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: data.model,
      provider: 'openai',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  /**
   * Anthropic Claude Integration
   */
  private async sendToAnthropic(messages: AIMessage[], options: any): Promise<AIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key not configured');

    // Convert messages format for Claude
    const system = messages.find((m) => m.role === 'system')?.content || '';
    const chatMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 4096,
        system,
        messages: chatMessages,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      model: data.model,
      provider: 'anthropic',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  /**
   * ElevenLabs Voice Agent Integration
   */
  private async sendToElevenLabs(messages: AIMessage[], options: any): Promise<AIResponse> {
    const elevenlabsUrl = process.env.ELEVENLABS_AGENT_URL || 'http://elevenlabs-agent:3000';

    const response = await fetch(`${elevenlabsUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: messages[messages.length - 1].content,
        model: options.model || 'anthropic/claude-3.5-sonnet',
        conversationHistory: messages.slice(0, -1),
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.response,
      model: data.model,
      provider: 'elevenlabs',
      usage: data.usage,
    };
  }

  /**
   * OpenRouter Multi-Model Integration
   */
  private async sendToOpenRouter(messages: AIMessage[], options: any): Promise<AIResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key not configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'FitAI Fitness Platform',
      },
      body: JSON.stringify({
        model: options.model || 'anthropic/claude-3.5-sonnet',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: data.model,
      provider: 'openrouter',
      usage: {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      },
    };
  }

  /**
   * Ollama Local AI Integration
   */
  private async sendToOllama(messages: AIMessage[], options: any): Promise<AIResponse> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'llama3.1:70b',
        messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      model: data.model,
      provider: 'ollama',
    };
  }

  /**
   * Generate workout plan using AI
   */
  async generateWorkoutPlan(userGoals: string, fitnessLevel: string, equipment: string[]) {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert fitness coach. Generate personalized workout plans based on user goals, fitness level, and available equipment. Provide detailed exercises, sets, reps, and rest periods.`,
      },
      {
        role: 'user',
        content: `Create a workout plan for:
- Goals: ${userGoals}
- Fitness Level: ${fitnessLevel}
- Available Equipment: ${equipment.join(', ')}

Provide a detailed weekly workout plan with specific exercises.`,
      },
    ];

    return await this.chat(messages, { maxTokens: 3000 });
  }

  /**
   * Generate nutrition plan using AI
   */
  async generateNutritionPlan(
    calories: number,
    macros: { protein: number; carbs: number; fats: number },
    dietaryRestrictions: string[]
  ) {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a certified nutritionist. Create personalized meal plans based on calorie targets, macronutrient ratios, and dietary restrictions.`,
      },
      {
        role: 'user',
        content: `Create a nutrition plan for:
- Daily Calories: ${calories}
- Macros: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fats}g fats
- Dietary Restrictions: ${dietaryRestrictions.join(', ')}

Provide a detailed daily meal plan with recipes.`,
      },
    ];

    return await this.chat(messages, { maxTokens: 3000 });
  }

  /**
   * Analyze workout form from description
   */
  async analyzeWorkoutForm(exerciseName: string, userDescription: string) {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a certified personal trainer specializing in exercise form and injury prevention. Analyze workout form and provide detailed feedback.`,
      },
      {
        role: 'user',
        content: `Exercise: ${exerciseName}
User's description: ${userDescription}

Analyze the form and provide detailed feedback on:
1. Correct form points
2. Common mistakes to avoid
3. Safety considerations
4. Progression tips`,
      },
    ];

    return await this.chat(messages, { maxTokens: 1500 });
  }

  /**
   * Get AI coaching advice
   */
  async getCoachingAdvice(question: string, context: any = {}) {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert fitness coach with 15+ years of experience. Provide science-based, actionable advice for all fitness-related questions.`,
      },
      {
        role: 'user',
        content: question,
      },
    ];

    return await this.chat(messages);
  }
}

// Export singleton instance
export const unifiedAI = new UnifiedAIClient({
  preferredProvider: 'anthropic',
  fallbackProviders: ['openai', 'openrouter', 'ollama'],
});
