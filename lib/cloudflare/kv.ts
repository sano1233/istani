import 'server-only';

/**
 * Cloudflare KV for distributed edge caching
 * Rate limits: 1,200 requests per 5 minutes on REST API
 * Pricing: $0.50/million reads, $5/million writes
 */
export class CloudflareKV {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    const namespaceId = process.env.KV_NAMESPACE_ID!;

    if (!accountId || !namespaceId) {
      throw new Error('Missing Cloudflare KV configuration');
    }

    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`;
    this.headers = {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get value from KV store
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const res = await fetch(`${this.baseUrl}/values/${key}`, {
        headers: this.headers,
      });

      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`KV get failed: ${res.statusText}`);

      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as any;
      }
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  /**
   * Put value into KV store with optional TTL
   */
  async put(key: string, value: any, ttl?: number): Promise<void> {
    const url = new URL(`${this.baseUrl}/values/${key}`);
    if (ttl) url.searchParams.set('expiration_ttl', ttl.toString());

    const body = typeof value === 'string' ? value : JSON.stringify(value);

    const res = await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body,
    });

    if (!res.ok) throw new Error(`KV put failed: ${res.statusText}`);
  }

  /**
   * Delete value from KV store
   */
  async delete(key: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/values/${key}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!res.ok) throw new Error(`KV delete failed: ${res.statusText}`);
  }

  /**
   * List keys with optional prefix
   */
  async list(prefix?: string): Promise<string[]> {
    const url = new URL(`${this.baseUrl}/keys`);
    if (prefix) url.searchParams.set('prefix', prefix);

    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`KV list failed: ${res.statusText}`);

    const data = await res.json();
    return data.result.map((item: any) => item.name);
  }
}

// Export singleton
export const kv = new CloudflareKV();
