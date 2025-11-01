import { NextRequest, NextResponse } from 'next/server';
import { agent } from '@/lib/autonomous/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Quick health check
    const health = await agent.healthCheck();

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: health.status,
        services: health.services,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV,
      },
      {
        status: health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'down',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
