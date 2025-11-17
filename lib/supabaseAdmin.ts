import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
    { auth: { persistSession: false } },
  );
}

// Export for backward compatibility
export const supabaseAdmin =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? getSupabaseAdmin()
    : (null as any);
