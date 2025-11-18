import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Maximum defensive coding - always return a valid response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Validate environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[MIDDLEWARE] Missing Supabase environment variables', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });
      return response;
    }

    // Dynamic import to ensure Edge Runtime compatibility
    const { createServerClient } = await import('@supabase/ssr');

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          try {
            return request.cookies.get(name)?.value;
          } catch (e) {
            console.error('[MIDDLEWARE] Cookie get error:', e);
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          try {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          } catch (e) {
            console.error('[MIDDLEWARE] Cookie set error:', e);
          }
        },
        remove(name: string, options: any) {
          try {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          } catch (e) {
            console.error('[MIDDLEWARE] Cookie remove error:', e);
          }
        },
      },
    });

    // Try to get user, but don't fail if it doesn't work
    try {
      await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)),
      ]);
    } catch (authError) {
      console.warn('[MIDDLEWARE] Auth getUser failed:', authError);
      // Continue anyway - this is not critical
    }
  } catch (error) {
    // Log comprehensive error details
    console.error('[MIDDLEWARE] Critical error in updateSession:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });
  }

  // Always return response - never throw
  return response;
}
