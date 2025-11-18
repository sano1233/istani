import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const warnOnce = (() => {
  let warned = false;
  return (message: string) => {
    if (!warned && process.env.NODE_ENV !== 'production') {
      console.warn(message);
      warned = true;
    }
  };
})();

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    warnOnce('Supabase environment variables missing, skipping auth middleware.');
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options?: CookieOptions) {
        response.cookies.set(name, '', {
          ...options,
          maxAge: 0,
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
