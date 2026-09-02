import "server-only";

type Bucket = { tokens: number; updatedAt: number };

declare global {
  var hrbpRateLimitBuckets: Map<string, Bucket> | undefined;
}

function buckets() {
  if (!globalThis.hrbpRateLimitBuckets) globalThis.hrbpRateLimitBuckets = new Map();
  return globalThis.hrbpRateLimitBuckets;
}

// Per-instance, in-memory token bucket; resets on redeploy and doesn't share state across instances.
export function checkRateLimit(
  key: string,
  options: { capacity: number; refillPerSecond: number },
): boolean {
  const now = Date.now();
  const store = buckets();
  const existing = store.get(key) ?? { tokens: options.capacity, updatedAt: now };

  const elapsedSeconds = Math.max(0, (now - existing.updatedAt) / 1000);
  const refreshed = Math.min(options.capacity, existing.tokens + elapsedSeconds * options.refillPerSecond);

  if (refreshed < 1) {
    store.set(key, { tokens: refreshed, updatedAt: now });
    return false;
  }

  store.set(key, { tokens: refreshed - 1, updatedAt: now });
  return true;
}
