import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates and returns a server-side Supabase client configured with app credentials or a build-time mock.
 *
 * The returned client is created with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY when available; if either is missing, a mock client using placeholder credentials is returned and a console warning is emitted. In both cases the client is configured with a cookies accessor that reads values from the server cookie store.
 *
 * @returns A Supabase server client instance configured with real environment credentials when present, otherwise a mock client using placeholder URL and anon key.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time
    // In production, these env vars must be set
    console.warn('Missing Supabase environment variables. Using mock client for build.');
    const cookieStore = await cookies();
    return createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
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