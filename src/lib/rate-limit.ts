// Simple in-memory rate limiter (best-effort). For robust production,
// back with Redis/Upstash or database counters.

type Key = string;
interface Entry { count: number; resetAt: number }
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 30);
const store = new Map<Key, Entry>();

// Upstash/Redis env
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function rateLimit(key: Key, limit: number = MAX_REQUESTS, windowMs: number = WINDOW_MS) {
  // If Upstash configured, use Redis-based limiter
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    const nowSec = Math.floor(Date.now() / 1000);
    const ttlSec = Math.ceil(windowMs / 1000);
    const bucketKey = `rl:${key}:${Math.floor(nowSec / ttlSec)}`;
    const resp = await fetch(`${UPSTASH_URL}/incr/${encodeURIComponent(bucketKey)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store',
    });
    if (!resp.ok) {
      return { allowed: true, remaining: limit - 1, resetAt: Date.now() + windowMs };
    }
    const count = await resp.json().then((d: any) => Number(d.result ?? 1)).catch(() => 1);
    if (count === 1) {
      // set expiry
      await fetch(`${UPSTASH_URL}/pexpire/${encodeURIComponent(bucketKey)}/${windowMs}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        cache: 'no-store',
      }).catch(() => {});
    }
    const remaining = Math.max(0, limit - count);
    const resetAt = Date.now() + windowMs;
    return { allowed: count <= limit, remaining, resetAt };
  }

  // Fallback: in-memory best-effort limiter
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
  const ip = headers.get('x-forwarded-for') || headers.get('cf-connecting-ip') || headers.get('x-real-ip') || 'unknown';
  return rateLimit(`${path}:${ip}`);
}

