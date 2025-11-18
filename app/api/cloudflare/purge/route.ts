/**
 * Cloudflare Cache Purge API Route
 * 
 * POST /api/cloudflare/purge
 * 
 * Purges Cloudflare cache for the zone.
 * Requires authentication via ADMIN_REFRESH_TOKEN or similar.
 * 
 * Body (optional):
 * {
 *   "files": ["https://istani.org/page1", "https://istani.org/page2"],
 *   "purgeEverything": false,
 *   "tags": ["tag1", "tag2"]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { purgeCache, verifyCloudflareToken } from '@/lib/cloudflare';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_REFRESH_TOKEN;

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin token not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify Cloudflare token is valid
    const tokenValid = await verifyCloudflareToken();
    if (!tokenValid) {
      console.warn('Cloudflare token verification failed, but continuing...');
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));

    const { files, purgeEverything, tags, hosts } = body;

    // Purge cache
    const result = await purgeCache({
      files,
      purgeEverything: purgeEverything === true,
      tags,
      hosts,
    });

    return NextResponse.json({
      success: true,
      message: 'Cache purged successfully',
      result,
    });
  } catch (error) {
    console.error('Error purging Cloudflare cache:', error);

    return NextResponse.json(
      {
        error: 'Failed to purge cache',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to verify Cloudflare configuration
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_REFRESH_TOKEN;

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Admin token not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify Cloudflare token
    const tokenValid = await verifyCloudflareToken();

    // Get zone info
    const { getZoneInfo } = await import('@/lib/cloudflare');
    const zoneInfo = await getZoneInfo().catch(() => null);

    return NextResponse.json({
      success: true,
      cloudflare: {
        tokenValid,
        zoneConfigured: !!process.env.CLOUDFLARE_ZONE_ID,
        accountConfigured: !!process.env.CLOUDFLARE_ACCOUNT_ID,
        zoneInfo: zoneInfo?.result || null,
      },
    });
  } catch (error) {
    console.error('Error checking Cloudflare configuration:', error);

    return NextResponse.json(
      {
        error: 'Failed to check configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
