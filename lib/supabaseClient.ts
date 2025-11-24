import { createClient } from '@supabase/supabase-js';

// Lazy client initialization with build-time safety
let clientInstance: any = null;

export function getSupabaseClient() {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, return a mock client to avoid errors
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Supabase env vars not set during build - using mock client');
      return null as any;
    }
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
    );
  }

  clientInstance = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  return clientInstance;
}

// Export for backward compatibility - lazy initialization
export const supabaseClient = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseClient()?.[prop];
  },
});
