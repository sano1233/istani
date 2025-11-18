/**
 * AI Enhancements
 * Food photo recognition, voice assistant, and advanced AI features
 */

export interface FoodRecognitionResult {
  foods: Array<{
    name: string;
    confidence: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  suggestions?: string[];
}

export interface VoiceCommand {
  type: 'log_meal' | 'log_workout' | 'get_stats' | 'set_goal' | 'unknown';
  parameters?: Record<string, any>;
  confidence: number;
}

/**
 * Photo Food Recognition using AI
 */
export class PhotoFoodRecognition {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Analyze food photo and identify items
   */
  async analyzePhoto(imageBase64: string): Promise<FoodRecognitionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert. Analyze food photos and identify all visible food items with estimated portions. Return results as JSON.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Identify all food items in this photo and estimate their nutritional content. Return as JSON with format: { "foods": [{ "name": "food name", "confidence": 0-1, "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number } }], "suggestions": ["suggestion1", "suggestion2"] }',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse JSON response
      const result = JSON.parse(content);
      return result;
    } catch (error) {
      console.error('Photo analysis failed:', error);
      return {
        foods: [],
        suggestions: ['Unable to analyze photo. Please try again.'],
      };
    }
  }

  /**
   * Get nutrition suggestions based on photo
   */
  async getSuggestions(imageBase64: string): Promise<string[]> {
    const result = await this.analyzePhoto(imageBase64);
    return result.suggestions || [];
  }
}

/**
 * Voice Assistant for hands-free logging
 */
export class VoiceAssistant {
  private recognition: any;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  /**
   * Start listening for voice commands
   */
  async startListening(onCommand: (command: VoiceCommand) => void): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.isListening = true;

    this.recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const confidence = event.results[0][0].confidence;

      const command = await this.parseCommand(transcript, confidence);
      onCommand(command);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Parse voice command using NLP
   */
  private async parseCommand(transcript: string, confidence: number): Promise<VoiceCommand> {
    // Simple pattern matching (can be enhanced with NLP API)
    if (transcript.includes('log meal') || transcript.includes('ate') || transcript.includes('had')) {
      return {
        type: 'log_meal',
        parameters: this.extractMealParameters(transcript),
        confidence,
      };
    }

    if (transcript.includes('workout') || transcript.includes('exercise') || transcript.includes('trained')) {
      return {
        type: 'log_workout',
        parameters: this.extractWorkoutParameters(transcript),
        confidence,
      };
    }

    if (transcript.includes('stats') || transcript.includes('progress') || transcript.includes('how am i doing')) {
      return {
        type: 'get_stats',
        parameters: {},
        confidence,
      };
    }

    if (transcript.includes('goal') || transcript.includes('target')) {
      return {
        type: 'set_goal',
        parameters: this.extractGoalParameters(transcript),
        confidence,
      };
    }

    return {
      type: 'unknown',
      parameters: { transcript },
      confidence,
    };
  }

  /**
   * Extract meal parameters from transcript
   */
  private extractMealParameters(transcript: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract meal type
    if (transcript.includes('breakfast')) params.mealType = 'breakfast';
    else if (transcript.includes('lunch')) params.mealType = 'lunch';
    else if (transcript.includes('dinner')) params.mealType = 'dinner';
    else if (transcript.includes('snack')) params.mealType = 'snack';

    // Extract food items (basic keyword extraction)
    const foodKeywords = ['chicken', 'rice', 'salad', 'apple', 'banana', 'egg', 'bread', 'pasta', 'fish'];
    params.foods = foodKeywords.filter(food => transcript.includes(food));

    return params;
  }

  /**
   * Extract workout parameters from transcript
   */
  private extractWorkoutParameters(transcript: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract workout type
    if (transcript.includes('run') || transcript.includes('running')) params.type = 'running';
    else if (transcript.includes('lift') || transcript.includes('weights')) params.type = 'weightlifting';
    else if (transcript.includes('yoga')) params.type = 'yoga';
    else if (transcript.includes('bike') || transcript.includes('cycling')) params.type = 'cycling';

    // Extract duration
    const durationMatch = transcript.match(/(\d+)\s*(minute|hour)/);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2];
      params.duration = unit === 'hour' ? value * 60 : value;
    }

    return params;
  }

  /**
   * Extract goal parameters from transcript
   */
  private extractGoalParameters(transcript: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract goal type
    if (transcript.includes('weight')) params.type = 'weight';
    else if (transcript.includes('calories')) params.type = 'calories';
    else if (transcript.includes('protein')) params.type = 'protein';

    // Extract target value
    const valueMatch = transcript.match(/(\d+)/);
    if (valueMatch) {
      params.value = parseInt(valueMatch[1]);
    }

    return params;
  }

  /**
   * Text-to-speech feedback
   */
  speak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}

/**
 * AI Meal Suggestions based on user preferences and history
 */
export class AIMealSuggestions {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  /**
   * Generate personalized meal suggestions
   */
  async generateSuggestions(userProfile: {
    goals: string[];
    dietaryRestrictions: string[];
    calorieTarget: number;
    macroTargets: { protein: number; carbs: number; fat: number };
    recentMeals?: string[];
  }): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are a nutritionist AI. Provide meal suggestions based on user goals and preferences.',
            },
            {
              role: 'user',
              content: `Generate 5 meal suggestions for someone with these requirements:
- Goals: ${userProfile.goals.join(', ')}
- Dietary restrictions: ${userProfile.dietaryRestrictions.join(', ')}
- Daily calories: ${userProfile.calorieTarget}
- Macros: ${userProfile.macroTargets.protein}g protein, ${userProfile.macroTargets.carbs}g carbs, ${userProfile.macroTargets.fat}g fat
- Recent meals (to avoid repetition): ${userProfile.recentMeals?.join(', ') || 'None'}

Return as JSON array of meal names.`,
            },
          ],
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('AI meal suggestion failed:', error);
      return [];
    }
  }
}

export const photoFoodRecognition = new PhotoFoodRecognition();
export const voiceAssistant = new VoiceAssistant();
export const aiMealSuggestions = new AIMealSuggestions();
