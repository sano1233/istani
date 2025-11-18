import { NextResponse } from 'next/server';
import { apiManager } from '@/lib/api-integrations';
import { createClient } from '@/lib/supabase/server';

/**
 * Health check endpoint for all API integrations
 * GET /api/health
 */
export async function GET() {
  try {
    // Check Supabase connection
    let supabaseStatus = 'ok';
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      supabaseStatus = `error: ${errorMessage}`;
    }

    // Check all external APIs
    const apiHealth = await apiManager.healthCheck();

    // Check Stripe (if configured)
    let stripeStatus = 'not_configured';
    if (process.env.STRIPE_SECRET_KEY) {
      stripeStatus = 'configured';
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseStatus,
        stripe: stripeStatus,
        ...apiHealth,
      },
      environment: {
        node: process.env.NODE_ENV || 'development',
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasGitHubToken: !!process.env.GITHUB_TOKEN,
        hasPexelsKey: !!process.env.PEXELS_API_KEY,
        hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
