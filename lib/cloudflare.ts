/**
 * Cloudflare API Integration
 * Handles cache purging and CDN management
 */

interface CloudflareResponse {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result?: unknown;
}

interface PurgeCacheOptions {
  files?: string[];
  tags?: string[];
  hosts?: string[];
  prefixes?: string[];
  everything?: boolean;
}

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

/**
 * Get Cloudflare configuration from environment variables
 */
function getCloudflareConfig() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set');
  }

  if (!zoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID environment variable is not set');
  }

  return { apiToken, zoneId, accountId };
}

/**
 * Make a request to the Cloudflare API
 */
async function cloudflareRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { apiToken } = getCloudflareConfig();

  const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await response.json()) as CloudflareResponse;

  if (!data.success) {
    const errorMessage = data.errors?.[0]?.message || 'Unknown Cloudflare API error';
    throw new Error(`Cloudflare API Error: ${errorMessage}`);
  }

  return data.result as T;
}

/**
 * Purge Cloudflare cache
 * @param options - Cache purge options
 * @returns Purge result
 */
export async function purgeCache(options: PurgeCacheOptions = {}): Promise<{ purge_id?: string }> {
  const { zoneId } = getCloudflareConfig();

  // Default to purging the main site
  const body = options.everything
    ? { purge_everything: true }
    : {
        files: options.files || [process.env.NEXT_PUBLIC_SITE_URL || ''],
        ...(options.tags && { tags: options.tags }),
        ...(options.hosts && { hosts: options.hosts }),
        ...(options.prefixes && { prefixes: options.prefixes }),
      };

  return cloudflareRequest(`/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Purge all cached files
 */
export async function purgeEverything(): Promise<{ purge_id?: string }> {
  return purgeCache({ everything: true });
}

/**
 * Purge specific files from cache
 * @param files - Array of file URLs to purge
 */
export async function purgeFiles(files: string[]): Promise<{ purge_id?: string }> {
  return purgeCache({ files });
}

/**
 * Purge cache by tags
 * @param tags - Array of cache tags to purge
 */
export async function purgeTags(tags: string[]): Promise<{ purge_id?: string }> {
  return purgeCache({ tags });
}

/**
 * Purge cache by prefixes
 * @param prefixes - Array of URL prefixes to purge
 */
export async function purgePrefixes(prefixes: string[]): Promise<{ purge_id?: string }> {
  return purgeCache({ prefixes });
}

/**
 * Verify Cloudflare API token
 */
export async function verifyToken(): Promise<{
  id: string;
  status: string;
}> {
  const { accountId } = getCloudflareConfig();

  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID is required for token verification');
  }

  return cloudflareRequest(`/accounts/${accountId}/tokens/verify`);
}

/**
 * Get zone details
 */
export async function getZoneDetails(): Promise<{
  id: string;
  name: string;
  status: string;
  name_servers: string[];
}> {
  const { zoneId } = getCloudflareConfig();
  return cloudflareRequest(`/zones/${zoneId}`);
}

/**
 * Get zone analytics
 * @param since - Minutes ago to fetch analytics from (default: 60)
 */
export async function getZoneAnalytics(since = 60): Promise<{
  totals: {
    requests: { all: number; cached: number; uncached: number };
    bandwidth: { all: number; cached: number; uncached: number };
    threats: { all: number };
  };
}> {
  const { zoneId } = getCloudflareConfig();
  const sinceTimestamp = Math.floor(Date.now() / 1000) - since * 60;

  return cloudflareRequest(`/zones/${zoneId}/analytics/dashboard?since=${sinceTimestamp}`);
}

/**
 * Purge cache on deployment
 * This should be called after a successful deployment
 */
export async function purgeDeploymentCache(): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.warn('NEXT_PUBLIC_SITE_URL not set, skipping cache purge');
    return;
  }

  try {
    // Purge main pages
    const pagesToPurge = [
      siteUrl,
      `${siteUrl}/`,
      `${siteUrl}/login`,
      `${siteUrl}/register`,
      `${siteUrl}/dashboard`,
      `${siteUrl}/products`,
      `${siteUrl}/meal-plan`,
      `${siteUrl}/workout`,
    ];

    // Purge Next.js static assets
    const staticAssetPrefixes = [`${siteUrl}/_next/static/`, `${siteUrl}/_next/image/`];

    await purgeFiles(pagesToPurge);
    console.log('✅ Cloudflare cache purged successfully');

    // Note: Prefix purging requires Enterprise plan
    // await purgePrefixes(staticAssetPrefixes);
  } catch (error) {
    console.error('❌ Failed to purge Cloudflare cache:', error);
    throw error;
  }
}

/**
 * Update development mode
 * When enabled, bypasses cache for 3 hours
 */
export async function setDevelopmentMode(enabled: boolean): Promise<void> {
  const { zoneId } = getCloudflareConfig();

  await cloudflareRequest(`/zones/${zoneId}/settings/development_mode`, {
    method: 'PATCH',
    body: JSON.stringify({ value: enabled ? 'on' : 'off' }),
  });

  console.log(`✅ Development mode ${enabled ? 'enabled' : 'disabled'} for 3 hours`);
}
