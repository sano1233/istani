import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, return a mock client
  if (!url || !key) {
    if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Supabase client env vars not set during build - using mock');
      // Return minimal mock for build-time
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signUp: async () => ({ data: null, error: null }),
          signInWithOAuth: async () => ({ data: null, error: null }),
          signInWithPassword: async () => ({ data: null, error: null }),
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      } as any;
    }
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  return createBrowserClient(url, key);
}
