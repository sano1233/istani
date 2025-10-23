import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnvConfig = {
  url: string;
  anonKey: string;
};

function resolveSupabaseConfig(): SupabaseEnvConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return { url, anonKey };
}

type GlobalWithSupabase = typeof globalThis & {
  __supabaseClient__?: SupabaseClient;
};

const globalForSupabase = globalThis as GlobalWithSupabase;

export async function createClient(): Promise<SupabaseClient> {
  if (globalForSupabase.__supabaseClient__) {
    return globalForSupabase.__supabaseClient__;
  }

  const { url, anonKey } = resolveSupabaseConfig();

  const client = createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  globalForSupabase.__supabaseClient__ = client;
  return client;
}
