// Simple in-memory rate limiter (best-effort). For robust production,
// back with Redis/Upstash or database counters.

type Key = string;
interface Entry { count: number; resetAt: number }
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;  // per window
const store = new Map<Key, Entry>();

export function rateLimit(key: Key, limit: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function rateLimitFromRequest(path: string, headers: Headers) {
  const ip = headers.get('x-forwarded-for') || headers.get('cf-connecting-ip') || 'unknown';
  return rateLimit(`${path}:${ip}`);
}

