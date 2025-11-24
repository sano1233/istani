import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Lazy admin client initialization with build-time safety
let adminInstance: any = null;

export function getSupabaseAdmin() {
  if (adminInstance) return adminInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time, return a mock client to avoid errors
  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Supabase admin env vars not set during build - using mock client');
      return null as any;
    }
    throw new Error(
      'Missing required Supabase Admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
    );
  }

  adminInstance = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  return adminInstance;
}

// Export for backward compatibility - lazy initialization
export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseAdmin()?.[prop];
  },
});
