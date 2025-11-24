import { NextResponse, type NextRequest } from 'next/server';

let missingEnvLogged = false;

/**
 * Validates Supabase environment variables and continues the request with original headers preserved.
 *
 * If required Supabase environment variables are missing, logs an error once and returns a NextResponse
 * that preserves the incoming request's headers. When environment variables are present, returns a
 * NextResponse that preserves the incoming request's headers. Session refresh is intentionally not
 * performed in middleware.
 *
 * @param request - The incoming NextRequest whose headers will be preserved on the returned response
 * @returns A NextResponse that continues the middleware chain with the original request headers
 */
export async function updateSession(request: NextRequest) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!missingEnvLogged) {
      console.error('Missing Supabase environment variables');
      missingEnvLogged = true;
    }
    // Return next response without auth if env vars are missing
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase session refresh is disabled in middleware to avoid Edge runtime incompatibilities.
  // Session handling should be performed within server actions or API routes.
  return response;
}