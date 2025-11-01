import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Create JWT token with 24 hour expiration
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setIssuer('istani-platform')
    .setAudience('istani-users')
    .sign(secret);
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'istani-platform',
      audience: 'istani-users',
    });
    return payload as any;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Create refresh token with 7 day expiration
 */
export async function createRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('istani-platform')
    .setAudience('istani-refresh')
    .sign(secret);
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'istani-platform',
      audience: 'istani-refresh',
    });
    return payload as any;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Set auth cookie (HttpOnly for security)
 */
export function createAuthCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';

  return [
    `auth-token=${token}`,
    'HttpOnly',
    'Path=/',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'Max-Age=86400', // 24 hours
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Set refresh cookie
 */
export function createRefreshCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';

  return [
    `refresh-token=${token}`,
    'HttpOnly',
    'Path=/api/auth/refresh',
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'Max-Age=604800', // 7 days
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Clear auth cookies
 */
export function createClearCookieHeaders(): string[] {
  return [
    'auth-token=; HttpOnly; Path=/; Max-Age=0',
    'refresh-token=; HttpOnly; Path=/api/auth/refresh; Max-Age=0',
  ];
}

/**
 * Extract token from cookies
 */
export function extractTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith('auth-token='));

  if (!authCookie) return null;

  return authCookie.split('=')[1];
}
