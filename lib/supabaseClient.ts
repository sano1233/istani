import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { auth: { persistSession: false } },
  );
}

// Export for backward compatibility
export const supabaseClient = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL ? getSupabaseClient() : null as any;
