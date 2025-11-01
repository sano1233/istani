import 'server-only';

/**
 * Cloudflare Workers AI for edge inference
 * Pricing: Neuron-based billing, free tier: 10,000 neurons daily
 */
export class WorkersAI {
  private accountId: string;
  private apiToken: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;

    if (!this.accountId || !this.apiToken) {
      throw new Error('Missing Cloudflare Workers AI configuration');
    }
  }

  /**
   * Run AI model at the edge
   */
  private async runModel(model: string, inputs: any): Promise<any> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      }
    );

    if (!response.ok) {
      throw new Error(`Workers AI error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate text using LLaMA or other models
   */
  async generateText(
    prompt: string,
    model: string = '@cf/meta/llama-3.1-8b-instruct'
  ): Promise<string> {
    const result = await this.runModel(model, { prompt });
    return result.result.response;
  }

  /**
   * Get embeddings for text (for semantic search)
   */
  async getEmbeddings(
    text: string | string[],
    model: string = '@cf/baai/bge-base-en-v1.5'
  ): Promise<number[][]> {
    const result = await this.runModel(model, { text });
    return result.result.data;
  }

  /**
   * Classify image
   */
  async classifyImage(
    imageUrl: string
  ): Promise<Array<{ label: string; score: number }>> {
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    const result = await this.runModel('@cf/microsoft/resnet-50', {
      image: Array.from(new Uint8Array(imageBuffer)),
    });

    return result.result;
  }

  /**
   * Translate text
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    const result = await this.runModel('@cf/meta/m2m100-1.2b', {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    return result.result.translated_text;
  }

  /**
   * Sentiment analysis
   */
  async analyzeSentiment(
    text: string
  ): Promise<Array<{ label: string; score: number }>> {
    const result = await this.runModel(
      '@cf/huggingface/distilbert-sst-2-int8',
      { text }
    );
    return result.result;
  }
}

// Export singleton
export const workersAI = new WorkersAI();
