import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[middleware] Supabase environment variables missing – skipping session refresh.');
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: any) {
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error('[middleware] Supabase session refresh failed:', error);
  }

  return response;
}
