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

// Unified API Manager
export class APIManager {
  public github: GitHubAPI;
  public pexels: PexelsAPI;
  public unsplash: UnsplashAPI;
  public openai: OpenAIAPI;
  public usda: USDAAPI;
  public openFoodFacts: OpenFoodFactsAPI;

  constructor() {
    this.github = new GitHubAPI();
    this.pexels = new PexelsAPI();
    this.unsplash = new UnsplashAPI();
    this.openai = new OpenAIAPI();
    this.usda = new USDAAPI();
    this.openFoodFacts = new OpenFoodFactsAPI();
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

    // OpenFoodFacts doesn't require auth
    results.openFoodFacts = { status: 'ok' };

    return results;
  }
}

// Export singleton instance
export const apiManager = new APIManager();
