import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Global rate limiter for all API routes
 * 100 requests per minute per IP
 */
export const globalRateLimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:global',
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

/**
 * AI generation rate limiter
 * 20 requests per minute per user
 */
export const aiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'ratelimit:ai',
});

/**
 * Payment operations rate limiter
 * 10 requests per minute per user
 */
export const paymentRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:payment',
});

/**
 * Helper to extract IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return '127.0.0.1';
}

/**
 * Check rate limit and return response headers
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}
