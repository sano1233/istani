/**
 * Cloudflare API Integration
 * Provides utilities for cache purging and zone management
 */

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
}

interface PurgeCacheOptions {
  files?: string[];
  tags?: string[];
  hosts?: string[];
  purgeEverything?: boolean;
}

/**
 * Purge Cloudflare cache
 * @param options - Purge options (files, tags, hosts, or everything)
 * @returns Cloudflare API response
 */
export async function purgeCache(
  options: PurgeCacheOptions = {},
): Promise<CloudflareResponse<{ id: string }>> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    throw new Error(
      'Cloudflare credentials not configured. Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables.',
    );
  }

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

  const body: any = {};

  if (options.purgeEverything) {
    body.purge_everything = true;
  } else if (options.files && options.files.length > 0) {
    body.files = options.files;
  } else if (options.tags && options.tags.length > 0) {
    body.tags = options.tags;
  } else if (options.hosts && options.hosts.length > 0) {
    body.hosts = options.hosts;
  } else {
    // Default: purge everything
    body.purge_everything = true;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudflare API error: ${error.errors?.[0]?.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Purge specific files from cache
 * @param files - Array of file URLs to purge
 */
export async function purgeFiles(files: string[]): Promise<CloudflareResponse<{ id: string }>> {
  return purgeCache({ files });
}

/**
 * Purge entire cache
 */
export async function purgeEverything(): Promise<CloudflareResponse<{ id: string }>> {
  return purgeCache({ purgeEverything: true });
}

/**
 * Get zone information
 */
export async function getZoneInfo(): Promise<CloudflareResponse<any>> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    throw new Error(
      'Cloudflare credentials not configured. Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables.',
    );
  }

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudflare API error: ${error.errors?.[0]?.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Verify Cloudflare API token
 */
export async function verifyToken(): Promise<CloudflareResponse<{ id: string; status: string }>> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN not configured');
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '8a96ac34caf00be04c7fa407efcefa85';
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/verify`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Cloudflare API error: ${error.errors?.[0]?.message || response.statusText}`);
  }

  return response.json();
}
