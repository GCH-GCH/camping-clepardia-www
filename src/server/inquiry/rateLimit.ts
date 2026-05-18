interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export const checkRateLimit = (
  key: string,
  maxRequests: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult => {
  const safeMax = Math.max(1, maxRequests);
  const safeWindow = Math.max(1000, windowMs);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + safeWindow;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: safeMax - 1, resetAt };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: current.count <= safeMax,
    remaining: Math.max(0, safeMax - current.count),
    resetAt: current.resetAt,
  };
};
