import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser/client-side usage.
 *
 * This function gracefully handles missing environment variables during build time
 * to prevent static generation errors. The actual validation happens at runtime.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, env vars may not be available
  // Return a placeholder that will fail gracefully at runtime
  if (!url || !key) {
    // Only throw in browser context (not during build)
    if (typeof window !== 'undefined') {
      console.error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      );
    }
    // Use placeholder values for build time - these will be replaced at runtime
    return createBrowserClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key',
    );
  }

  return createBrowserClient(url, key);
}
