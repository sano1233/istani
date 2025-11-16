import { NextResponse } from 'next/server'
import { runDailyCoachingTasks } from '@/lib/autonomous/coaching-engine'

/**
 * Vercel Cron Job Endpoint
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-coaching",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 */

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  try {
    await runDailyCoachingTasks()

    return NextResponse.json({
      success: true,
      message: 'Daily coaching tasks completed',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
