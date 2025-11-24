import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, environment variables might not be available
  // Return a dummy client that will be replaced at runtime
  if (!url || !key) {
    // Only throw in browser/runtime, not during build
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      );
    }
    // Return a dummy client for build time
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }

  return createBrowserClient(url, key);
}
