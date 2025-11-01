import 'server-only';

/**
 * Cloudflare Browser Rendering for web scraping
 * Pricing: $0.09 per browser hour
 */
export class BrowserRendering {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN!;

    if (!accountId || !apiToken) {
      throw new Error('Missing Cloudflare Browser Rendering configuration');
    }

    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering`;
    this.headers = {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Take screenshot of a webpage
   */
  async screenshot(url: string, fullPage: boolean = false): Promise<Buffer> {
    const res = await fetch(`${this.baseUrl}/screenshot`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        url,
        screenshotOptions: { type: 'png', fullPage },
        viewport: { width: 1920, height: 1080 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Browser Rendering screenshot failed: ${res.statusText}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  /**
   * Extract text content from webpage
   */
  async extractContent(url: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/content`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      throw new Error(`Browser Rendering content extraction failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.content;
  }

  /**
   * Extract structured JSON data using AI prompt
   */
  async extractJSON(url: string, prompt: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/json`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ url, prompt }),
    });

    if (!res.ok) {
      throw new Error(`Browser Rendering JSON extraction failed: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Generate PDF from webpage
   */
  async generatePDF(url: string): Promise<Buffer> {
    const res = await fetch(`${this.baseUrl}/pdf`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        url,
        pdfOptions: {
          format: 'A4',
          printBackground: true,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Browser Rendering PDF generation failed: ${res.statusText}`);
    }

    return Buffer.from(await res.arrayBuffer());
  }
}

// Export singleton
export const browserRendering = new BrowserRendering();
