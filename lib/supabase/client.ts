import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase browser client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * If those environment variables are not present, returns a mock client initialized with placeholder
 * URL and anon key and emits a console warning (used as a build-time fallback).
 *
 * @returns A Supabase browser client configured with the environment credentials, or a mock client with placeholder URL and anon key when the environment variables are missing.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client for build time
    // In production, these env vars must be set
    console.warn('Missing Supabase environment variables. Using mock client for build.');
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
    );
  }

  return createBrowserClient(url, key);
}