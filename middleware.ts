import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Enterprise-grade middleware with:
 * - Session management
 * - Security headers
 * - Request logging
 * - Error handling
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Update Supabase session
    const response = await updateSession(request);

    // Add enterprise security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    );

    // Add request ID for tracing
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);

    // Add timing headers
    const duration = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${duration}ms`);

    // Log request (in production, this would go to a logging service)
    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          method: request.method,
          path: request.nextUrl.pathname,
          duration,
          requestId,
          userAgent: request.headers.get('user-agent'),
        }),
      );
    }

    return response;
  } catch (error) {
    // Log error and return fallback response
    console.error('Middleware error:', error);

    const fallbackResponse = NextResponse.next();

    // Still add security headers even on error
    fallbackResponse.headers.set('X-Content-Type-Options', 'nosniff');
    fallbackResponse.headers.set('X-Frame-Options', 'DENY');

    return fallbackResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - api/webhooks (webhook endpoints)
     * - Static assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
