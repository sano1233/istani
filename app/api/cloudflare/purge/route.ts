/**
 * Cloudflare Cache Purge API Endpoint
 * POST /api/cloudflare/purge
 *
 * Allows manual cache purging with authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { purgeCache, purgeEverything, purgeFiles, purgeTags } from '@/lib/cloudflare';

export const runtime = 'edge';

/**
 * Verify admin authentication
 */
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Check against admin token
  const adminToken = process.env.ADMIN_REFRESH_TOKEN;

  if (!adminToken) {
    console.error('ADMIN_REFRESH_TOKEN not configured');
    return false;
  }

  return token === adminToken;
}

/**
 * POST /api/cloudflare/purge
 *
 * Request body:
 * {
 *   "type": "everything" | "files" | "tags" | "default",
 *   "files": ["https://example.com/page1", "https://example.com/page2"],
 *   "tags": ["tag1", "tag2"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token',
        },
        { status: 401 },
      );
    }

    // Check if Cloudflare is configured
    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration Error',
          message: 'Cloudflare is not configured on this server',
        },
        { status: 500 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { type = 'default', files, tags } = body;

    let result;
    let description;

    // Execute the appropriate purge operation
    switch (type) {
      case 'everything':
        description = 'Purging all cached files';
        result = await purgeEverything();
        break;

      case 'files':
        if (!files || !Array.isArray(files) || files.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid Request',
              message: 'Files array is required for type "files"',
            },
            { status: 400 },
          );
        }
        description = `Purging ${files.length} specific files`;
        result = await purgeFiles(files);
        break;

      case 'tags':
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid Request',
              message: 'Tags array is required for type "tags"',
            },
            { status: 400 },
          );
        }
        description = `Purging cache by ${tags.length} tags`;
        result = await purgeTags(tags);
        break;

      case 'default':
      default:
        description = 'Purging default pages';
        result = await purgeCache();
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Cache purged successfully',
      description,
      purge_id: result.purge_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cloudflare cache purge error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Purge Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cloudflare/purge
 *
 * Get information about the cache purge endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cloudflare/purge',
    method: 'POST',
    authentication: 'Bearer token required (ADMIN_REFRESH_TOKEN)',
    description: 'Purge Cloudflare CDN cache',
    usage: {
      purge_all: {
        type: 'everything',
      },
      purge_files: {
        type: 'files',
        files: ['https://example.com/page1', 'https://example.com/page2'],
      },
      purge_tags: {
        type: 'tags',
        tags: ['tag1', 'tag2'],
      },
      purge_default: {
        type: 'default',
      },
    },
    examples: [
      {
        description: 'Purge specific pages',
        curl: `curl -X POST https://istani.org/api/cloudflare/purge \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"files","files":["https://istani.org/","https://istani.org/dashboard"]}'`,
      },
      {
        description: 'Purge all cache (use with caution)',
        curl: `curl -X POST https://istani.org/api/cloudflare/purge \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"everything"}'`,
      },
    ],
  });
}
