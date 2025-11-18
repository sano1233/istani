import { NextResponse, type NextRequest } from 'next/server';

/**
 * EMERGENCY MINIMAL MIDDLEWARE
 * Use this if the main middleware continues to fail.
 *
 * To activate:
 * 1. Rename middleware.ts to middleware.ts.backup
 * 2. Rename this file to middleware.ts
 * 3. Deploy
 */

export async function middleware(request: NextRequest) {
  // Absolute minimum - just pass through all requests
  // No Supabase, no auth, just let everything through
  console.log('[MINIMAL MIDDLEWARE] Request:', request.url);

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
