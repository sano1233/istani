/**
 * Unified API Manager
 * Handles all external API integrations with automatic fallbacks and caching
 */

interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey: string | undefined;
  rateLimit: number;
  fallback?: string;
}

interface ImageSearchResult {
  id: string;
  url: string;
  thumb Url: string;
  photographer: string;
  source: 'pexels' | 'unsplash' | 'placeholder';
}

export class APIManager {
  private requestCounts: Map<string, number> = new Map();
  private lastResetTime: Map<string, number> = new Map();

  private apis: Record<string, APIConfig> = {
    pexels: {
      name: 'Pexels',
      baseUrl: 'https://api.pexels.com/v1',
      apiKey: process.env.PEXELS_API_KEY,
      rateLimit: 200,
      fallback: 'unsplash'
    },
    unsplash: {
      name: 'Unsplash',
      baseUrl: 'https://api.unsplash.com',
      apiKey: process.env.UNSPLASH_ACCESS_KEY,
      rateLimit: 50,
      fallback: 'placeholder'
    },
    usda: {
      name: 'USDA FoodData',
      baseUrl: 'https://api.nal.usda.gov/fdc/v1',
      apiKey: process.env.USDA_API_KEY,
      rateLimit: 1000
    },
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY,
      rateLimit: 60
    }
  };

  /**
   * Check if API is available and within rate limits
   */
  private async checkRateLimit(apiName: string): Promise<boolean> {
    const config = this.apis[apiName];
    if (!config) return false;

    const now = Date.now();
    const lastReset = this.lastResetTime.get(apiName) || now;
    const count = this.requestCounts.get(apiName) || 0;

    // Reset counter every hour
    if (now - lastReset > 3600000) {
      this.requestCounts.set(apiName, 0);
      this.lastResetTime.set(apiName, now);
      return true;
    }

    return count < config.rateLimit;
  }

  /**
   * Increment request count for rate limiting
   */
  private incrementRequestCount(apiName: string): void {
    const count = this.requestCounts.get(apiName) || 0;
    this.requestCounts.set(apiName, count + 1);
  }

  /**
   * Search for fitness-related images with automatic fallback
   */
  async searchFitnessImage(query: string): Promise<ImageSearchResult> {
    // Try Pexels first
    if (this.apis.pexels.apiKey && await this.checkRateLimit('pexels')) {
      try {
        const result = await this.searchPexelsImage(query);
        if (result) return result;
      } catch (error) {
        console.error('Pexels API error:', error);
      }
    }

    // Fallback to Unsplash
    if (this.apis.unsplash.apiKey && await this.checkRateLimit('unsplash')) {
      try {
        const result = await this.searchUnsplashImage(query);
        if (result) return result;
      } catch (error) {
        console.error('Unsplash API error:', error);
      }
    }

    // Final fallback to placeholder
    return this.getPlaceholderImage(query);
  }

  /**
   * Search Pexels for images
   */
  private async searchPexelsImage(query: string): Promise<ImageSearchResult | null> {
    if (!this.apis.pexels.apiKey) return null;

    this.incrementRequestCount('pexels');

    const response = await fetch(
      `${this.apis.pexels.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          'Authorization': this.apis.pexels.apiKey
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      return {
        id: photo.id.toString(),
        url: photo.src.large,
        thumbUrl: photo.src.medium,
        photographer: photo.photographer,
        source: 'pexels'
      };
    }

    return null;
  }

  /**
   * Search Unsplash for images
   */
  private async searchUnsplashImage(query: string): Promise<ImageSearchResult | null> {
    if (!this.apis.unsplash.apiKey) return null;

    this.incrementRequestCount('unsplash');

    const response = await fetch(
      `${this.apis.unsplash.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${this.apis.unsplash.apiKey}`,
      {
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        id: photo.id,
        url: photo.urls.regular,
        thumbUrl: photo.urls.small,
        photographer: photo.user.name,
        source: 'unsplash'
      };
    }

    return null;
  }

  /**
   * Get placeholder image as final fallback
   */
  private getPlaceholderImage(query: string): ImageSearchResult {
    const seed = query.replace(/\s+/g, '-').toLowerCase();
    return {
      id: `placeholder-${seed}`,
      url: `https://placehold.co/1200x800/1a1a1a/white?text=${encodeURIComponent(query)}`,
      thumbUrl: `https://placehold.co/600x400/1a1a1a/white?text=${encodeURIComponent(query)}`,
      photographer: 'Placeholder',
      source: 'placeholder'
    };
  }

  /**
   * Search USDA database for nutrition info
   */
  async searchFood(query: string): Promise<any[]> {
    if (!this.apis.usda.apiKey || !await this.checkRateLimit('usda')) {
      return [];
    }

    this.incrementRequestCount('usda');

    try {
      const response = await fetch(
        `${this.apis.usda.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${this.apis.usda.apiKey}`,
        {
          next: { revalidate: 604800 } // Cache for 1 week
        }
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.foods || [];
    } catch (error) {
      console.error('USDA API error:', error);
      return [];
    }
  }

  /**
   * Generate AI workout plan using OpenAI
   */
  async generateWorkoutPlan(userProfile: {
    goal: string;
    level: string;
    equipment: string[];
  }): Promise<string> {
    if (!this.apis.openai.apiKey || !await this.checkRateLimit('openai')) {
      return this.getFallbackWorkoutPlan(userProfile);
    }

    this.incrementRequestCount('openai');

    try {
      const response = await fetch(
        `${this.apis.openai.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apis.openai.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system',
                content: 'You are a professional fitness trainer. Create personalized workout plans.'
              },
              {
                role: 'user',
                content: `Create a workout plan for: Goal: ${userProfile.goal}, Level: ${userProfile.level}, Equipment: ${userProfile.equipment.join(', ')}`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackWorkoutPlan(userProfile);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackWorkoutPlan(userProfile);
    }
  }

  /**
   * Fallback workout plan when AI is unavailable
   */
  private getFallbackWorkoutPlan(userProfile: any): string {
    return `
# Your Personalized Workout Plan

**Goal:** ${userProfile.goal}
**Level:** ${userProfile.level}
**Equipment:** ${userProfile.equipment.join(', ')}

## Day 1: Upper Body
- Push-ups: 3 sets x 12 reps
- Dumbbell rows: 3 sets x 10 reps
- Shoulder press: 3 sets x 10 reps
- Plank: 3 sets x 45 seconds

## Day 2: Lower Body
- Squats: 4 sets x 12 reps
- Lunges: 3 sets x 10 reps per leg
- Romanian deadlifts: 3 sets x 10 reps
- Calf raises: 3 sets x 15 reps

## Day 3: Full Body
- Burpees: 3 sets x 10 reps
- Mountain climbers: 3 sets x 20 reps
- Pull-ups: 3 sets x max reps
- Plank: 3 sets x 60 seconds

**Note:** This is a template plan. For AI-generated personalized plans, configure your OpenAI API key.
`;
  }

  /**
   * Get API status for all services
   */
  async getAPIStatus(): Promise<Record<string, { available: boolean; withinRateLimit: boolean }>> {
    const status: Record<string, { available: boolean; withinRateLimit: boolean }> = {};

    for (const [key, config] of Object.entries(this.apis)) {
      status[key] = {
        available: !!config.apiKey,
        withinRateLimit: await this.checkRateLimit(key)
      };
    }

    return status;
  }
}

// Export singleton instance
export const apiManager = new APIManager();
