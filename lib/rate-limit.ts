/**
 * Rate Limiting Utility for API Routes
 * Implements a simple in-memory rate limiter using a sliding window
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of unique tokens per interval
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class RateLimiter {
  private cache: Map<string, number[]> = new Map();
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(config: RateLimitConfig) {
    this.interval = config.interval;
    this.uniqueTokenPerInterval = config.uniqueTokenPerInterval;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.cache.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < this.interval);
      if (validTimestamps.length === 0) {
        this.cache.delete(key);
      } else {
        this.cache.set(key, validTimestamps);
      }
    }
  }

  check(token: string): RateLimitResult {
    const now = Date.now();
    const timestamps = this.cache.get(token) || [];

    // Remove timestamps outside the current window
    const validTimestamps = timestamps.filter((t) => now - t < this.interval);

    const remaining = Math.max(0, this.uniqueTokenPerInterval - validTimestamps.length);
    const success = remaining > 0;

    if (success) {
      validTimestamps.push(now);
      this.cache.set(token, validTimestamps);
    }

    const oldestTimestamp = validTimestamps[0] || now;
    const reset = oldestTimestamp + this.interval;

    return {
      success,
      limit: this.uniqueTokenPerInterval,
      remaining: success ? remaining - 1 : 0,
      reset: Math.ceil(reset / 1000),
    };
  }

  reset(token: string) {
    this.cache.delete(token);
  }
}

// Create rate limiters with different configurations
const limiters = {
  // Strict: 10 requests per minute
  strict: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 10,
  }),

  // Standard: 30 requests per minute
  standard: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 30,
  }),

  // Relaxed: 100 requests per minute
  relaxed: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,
  }),

  // AI endpoints: 5 requests per minute (more expensive)
  ai: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 5,
  }),
};

/**
 * Rate limit middleware helper
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param type - Type of rate limit to apply
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  type: 'strict' | 'standard' | 'relaxed' | 'ai' = 'standard',
): RateLimitResult {
  const limiter = limiters[type];
  return limiter.check(identifier);
}

/**
 * Get client identifier from request
 * Uses IP address or user ID if available
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Check rate limit and return error response if exceeded
 * @param request - The incoming request
 * @param userId - Optional user ID for authenticated requests
 * @param type - Type of rate limit to apply
 * @returns null if allowed, Response if rate limited
 */
export function checkRateLimit(
  request: Request,
  userId?: string,
  type: 'strict' | 'standard' | 'relaxed' | 'ai' = 'standard',
): { allowed: boolean; headers: HeadersInit; retryAfter?: number } {
  const identifier = getClientIdentifier(request, userId);
  const result = rateLimit(identifier, type);
  const headers = createRateLimitHeaders(result);

  if (!result.success) {
    return {
      allowed: false,
      headers,
      retryAfter: result.reset - Math.floor(Date.now() / 1000),
    };
  }

  return {
    allowed: true,
    headers,
  };
}
