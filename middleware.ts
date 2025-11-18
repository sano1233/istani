import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Import dynamically to avoid Edge Runtime issues
    const { updateSession } = await import('@/lib/supabase/middleware');
    return await updateSession(request);
  } catch (error) {
    // Emergency fallback - log error but always allow request through
    console.error('[MIDDLEWARE ERROR]', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      timestamp: new Date().toISOString(),
    });

    // Always return a valid response to prevent 500 errors
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
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
