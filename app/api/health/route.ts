import { NextResponse } from 'next/server';
import { apiManager } from '@/lib/api-integrations';
import { createClient } from '@/lib/supabase/server';
import { getAvailableProviders, checkAIProvidersHealth } from '@/lib/ai-providers';

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

    // Check AI providers
    const aiProviders = getAvailableProviders();
    const aiHealth = await checkAIProvidersHealth();

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
      ai_providers: {
        available: aiProviders,
        primary: aiProviders[0] || null,
        health: aiHealth,
      },
      environment: {
        node: process.env.NODE_ENV || 'development',
        // Core services
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        // AI Providers
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasQwenKey: !!process.env.QWEN_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
        hasElevenLabsKey: !!process.env.ELEVEN_LABS_API_KEY,
        // Image APIs
        hasGitHubToken: !!process.env.GITHUB_TOKEN,
        hasPexelsKey: !!process.env.PEXELS_API_KEY,
        hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
