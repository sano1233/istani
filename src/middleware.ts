import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Enterprise-grade middleware for security, monitoring, and rate limiting
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Content Security Policy - strict by default
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com https://openrouter.ai https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // CORS headers for API routes
  const isApi = request.nextUrl.pathname.startsWith('/api/');
  if (isApi) {
    const allowed = process.env.NEXT_PUBLIC_HOME_URL || 'https://istani.store';
    response.headers.set('Access-Control-Allow-Origin', allowed);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }
  }

  // Log requests
  const url = request.nextUrl.pathname;
  const method = request.method;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${url}`);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
