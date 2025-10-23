import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  key: string;
}

function resolveSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL to use the Notes feature.'
    );
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY to use the Notes feature.'
    );
  }

  return { url, key };
}

export function createClient(): SupabaseClient {
  const { url, key } = resolveSupabaseConfig();

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}
