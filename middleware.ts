import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates session state for the incoming Next.js request and continues the request pipeline.
 *
 * If session update fails, the error is logged and a pass-through response is returned to allow the request to proceed.
 *
 * @param request - The incoming Next.js request to associate with the session update
 * @returns A NextResponse representing the updated session handling result, or a pass-through `NextResponse` that continues the request pipeline on failure
 */
export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    // Log and return a fallback response if middleware fails
    console.error('Middleware error:', error);
    // Return next response to continue the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (webhook endpoints that should not be processed by middleware)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
