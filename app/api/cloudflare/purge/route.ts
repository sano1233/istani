import { NextRequest, NextResponse } from 'next/server';
import { purgeCache, purgeFiles, purgeEverything } from '@/lib/cloudflare';

/**
 * POST /api/cloudflare/purge
 * Purge Cloudflare cache
 * 
 * Body options:
 * - { files: string[] } - Purge specific files
 * - { purgeEverything: true } - Purge entire cache
 * - { tags: string[] } - Purge by cache tags
 * - { hosts: string[] } - Purge by hostnames
 * 
 * Requires CLOUDFLARE_PURGE_SECRET header for security
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Require secret token to prevent unauthorized cache purges
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

    const body = await request.json();

    let result;

    if (body.purgeEverything) {
      result = await purgeEverything();
    } else if (body.files && Array.isArray(body.files)) {
      result = await purgeFiles(body.files);
    } else {
      result = await purgeCache(body);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to purge cache',
          details: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cache purged successfully',
      result: result.result,
    });
  } catch (error: any) {
    console.error('Cloudflare purge error:', error);
    return NextResponse.json(
      {
        error: 'Failed to purge cache',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
