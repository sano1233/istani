/**
 * Cloudflare API Integration
 *
 * Provides functions to interact with Cloudflare API for cache management
 * and zone configuration.
 *
 * Required environment variables:
 * - CLOUDFLARE_API_TOKEN: API token with Zone:Read, Zone:Edit, Cache Purge permissions
 * - CLOUDFLARE_ZONE_ID: Zone ID for istani.org (found in Cloudflare dashboard)
 * - CLOUDFLARE_ACCOUNT_ID: Account ID (optional, for account-level operations)
 */

interface CloudflareResponse<T> {
  success: boolean;
  result: T;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
}

interface PurgeCacheOptions {
  files?: string[];
  tags?: string[];
  hosts?: string[];
  purgeEverything?: boolean;
}

/**
 * Verify Cloudflare API token is valid
 */
export async function verifyCloudflareToken(): Promise<boolean> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!token) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set');
  }

  if (!accountId) {
    console.warn('CLOUDFLARE_ACCOUNT_ID not set, skipping token verification');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data: CloudflareResponse<{ id: string; status: string }> = await response.json();

    if (data.success && data.result.status === 'active') {
      return true;
    }

    console.error('Cloudflare token verification failed:', data.errors);
    return false;
  } catch (error) {
    console.error('Error verifying Cloudflare token:', error);
    return false;
  }
}

/**
 * Purge Cloudflare cache
 *
 * @param options - Purge options (files, tags, hosts, or purgeEverything)
 * @returns Promise with purge result
 */
export async function purgeCache(
  options: PurgeCacheOptions = {},
): Promise<CloudflareResponse<{ id: string }>> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set');
  }

  if (!zoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID environment variable is not set');
  }

  // Validate that at least one purge method is specified
  const hasFiles = options.files && options.files.length > 0;
  const hasTags = options.tags && options.tags.length > 0;
  const hasHosts = options.hosts && options.hosts.length > 0;
  const hasPurgeEverything = options.purgeEverything === true;

  if (!hasFiles && !hasTags && !hasHosts && !hasPurgeEverything) {
    throw new Error(
      'At least one purge option must be specified (files, tags, hosts, or purgeEverything)',
    );
  }

  const body: any = {};

  if (hasFiles) {
    body.files = options.files;
  }
  if (hasTags) {
    body.tags = options.tags;
  }
  if (hasHosts) {
    body.hosts = options.hosts;
  }
  if (hasPurgeEverything) {
    body.purge_everything = true;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data: CloudflareResponse<{ id: string }> = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${data.errors.map((e) => e.message).join(', ')}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to purge Cloudflare cache: ${error}`);
  }
}

/**
 * Purge cache for specific files/URLs
 *
 * @param files - Array of file URLs to purge
 * @returns Promise with purge result
 */
export async function purgeFiles(files: string[]): Promise<CloudflareResponse<{ id: string }>> {
  return purgeCache({ files });
}

/**
 * Purge entire cache for the zone
 *
 * @returns Promise with purge result
 */
export async function purgeEverything(): Promise<CloudflareResponse<{ id: string }>> {
  return purgeCache({ purgeEverything: true });
}

/**
 * Purge cache by tags
 *
 * @param tags - Array of cache tags to purge
 * @returns Promise with purge result
 */
export async function purgeByTags(tags: string[]): Promise<CloudflareResponse<{ id: string }>> {
  return purgeCache({ tags });
}

/**
 * Get zone information
 */
export async function getZoneInfo(): Promise<CloudflareResponse<any>> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set');
  }

  if (!zoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID environment variable is not set');
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to get zone info: ${error}`);
  }
}
