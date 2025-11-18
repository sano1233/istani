import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // For now, skip middleware entirely to prevent blocking
    // This allows the app to function without Supabase
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Always return a response to prevent blocking
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
     * - api routes (handle auth separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
