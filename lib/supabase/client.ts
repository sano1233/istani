import { createBrowserClient } from '@supabase/ssr';

import { createSupabaseFallbackClient } from './fallback';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return createSupabaseFallbackClient();
  }

  return createBrowserClient(url, key);
}
