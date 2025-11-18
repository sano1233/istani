import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getZoneInfo } from '@/lib/cloudflare';

/**
 * GET /api/cloudflare/verify
 * Verify Cloudflare API token and get zone information
 * 
 * Requires CLOUDFLARE_PURGE_SECRET header for security
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Require secret token
    const secret = request.headers.get('CLOUDFLARE_PURGE_SECRET');
    const expectedSecret = process.env.CLOUDFLARE_PURGE_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Cloudflare purge secret not configured' },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const tokenResult = await verifyToken();

    if (!tokenResult.success) {
      return NextResponse.json(
        {
          error: 'Token verification failed',
          details: tokenResult.errors,
        },
        { status: 400 }
      );
    }

    // Get zone info if zone ID is configured
    let zoneInfo = null;
    if (process.env.CLOUDFLARE_ZONE_ID) {
      try {
        const zoneResult = await getZoneInfo();
        if (zoneResult.success) {
          zoneInfo = {
            id: zoneResult.result.id,
            name: zoneResult.result.name,
            status: zoneResult.result.status,
          };
        }
      } catch (error) {
        // Zone info is optional, don't fail if it errors
        console.warn('Failed to get zone info:', error);
      }
    }

    return NextResponse.json({
      success: true,
      token: {
        id: tokenResult.result.id,
        status: tokenResult.result.status,
      },
      zone: zoneInfo,
      message: zoneInfo
        ? 'Token verified and zone accessible'
        : 'Token verified (zone ID not configured)',
    });
  } catch (error: any) {
    console.error('Cloudflare verify error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify Cloudflare configuration',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
