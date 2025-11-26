import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client for build time
    // In production, these env vars must be set
    console.warn('Missing Supabase environment variables. Using mock client for build.');
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }

  return createBrowserClient(url, key);
}
