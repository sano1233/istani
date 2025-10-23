import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/monitoring';

export const runtime = 'edge';

export async function GET() {
  const health = await healthCheck();

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
