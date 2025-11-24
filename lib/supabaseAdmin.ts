import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required Supabase Admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

// Export for backward compatibility
export const supabaseAdmin =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? getSupabaseAdmin()
    : (null as any);
