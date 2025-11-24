import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
    );
  }

  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

// Export for backward compatibility
export const supabaseClient =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? getSupabaseClient()
    : (null as any);
