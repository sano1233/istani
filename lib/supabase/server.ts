import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, return a mock client with minimal functionality
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Supabase env vars not set during build - using mock client');
      // Return a minimal mock that won't crash during static generation
      // Comprehensive mock client for build time
      const mockQuery = {
        eq: () => mockQuery,
        neq: () => mockQuery,
        gt: () => mockQuery,
        gte: () => mockQuery,
        lt: () => mockQuery,
        lte: () => mockQuery,
        like: () => mockQuery,
        ilike: () => mockQuery,
        is: () => mockQuery,
        in: () => mockQuery,
        or: () => mockQuery,
        filter: () => mockQuery,
        order: () => mockQuery,
        limit: () => mockQuery,
        range: () => mockQuery,
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        then: (resolve: any) => resolve({ data: [], error: null }),
      };

      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signIn: async () => ({ data: null, error: null }),
          signUp: async () => ({ data: null, error: null }),
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => mockQuery,
          insert: async () => ({ data: null, error: null }),
          update: () => mockQuery,
          upsert: async () => ({ data: null, error: null }),
          delete: () => mockQuery,
        }),
      } as any;
    }
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
