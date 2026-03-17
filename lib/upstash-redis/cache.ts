import { redis } from "./redis";

export const cacheKeys = {
    user: (userId: string) => `user:${userId}`,

    jobId: (jobId: string) => `job:${jobId}`,

    credits: (userId: string) => `credits:${userId}`,
    pendingDeduction: (userId: string, opId: string) => `pending_deduction:${userId}:${opId}`,

    activeRender: (userId: string) => `rendering:${userId}`,

    // Animation caching
    animation: (animationId: string) => `animation:${animationId}`,
    userAnimations: (userId: string) => `animations:user:${userId}`,

    // Rate Limiting
    rateLimit: (identifier: string, action: string) => `ratelimit:${action}:${identifier}`,
};

export const CacheTTL = {
    user: 60 * 60, // 1 hour
    job: 60 * 60 * 24, // 1 day
    credits: 60 * 30, // 30 minutes
    rendering: 60 * 10, // 10 minutes
    animation: 60 * 60 * 6, // 6 hours
    userAnimatons: 60 * 10, // 10 minutes
    rateLimit: 60 * 60, // 1 hour
};

function withTimeout<T>(promise: Promise<T>, ms = 1000): Promise<T | null> {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
    return Promise.race([promise, timeout]);
}

function isRedisDisabled(): boolean {
    return process.env.REDIS_ENABLED === "false";
}

// ─── GET ────────────────────────────────────────────────────────────────────
export async function getCachedData<T>(key: string): Promise<T | null> {
    if (isRedisDisabled()) return null;

    try {
        const data = await withTimeout(redis.get<T>(key));
        return data ?? null;
    } catch (error) {
        console.log(`[Cache GET] key = ${key}`, error);
        return null;
    }
}

// ─── SET ────────────────────────────────────────────────────────────────────
export async function setCachedData<T>(
    key: string,
    data: T,
    ttl: number = CacheTTL.user
): Promise<void> {
    if (isRedisDisabled()) return;

    try {
        await withTimeout(redis.set(key, JSON.stringify(data), { ex: ttl }));
    } catch (error) {
        console.log(`[Cache SET] key = ${key}`, error);
    }
}

// ─── DELETE ─────────────────────────────────────────────────────────────────
export async function deleteCachedData(keys: string | string[]): Promise<void> {
    if (isRedisDisabled()) return;

    try {
        const keyList = Array.isArray(keys) ? keys : [keys];
        await withTimeout(redis.del(...keyList));
    } catch (error) {
        console.log(`[Cache DELETE] key = ${keys}`, error);
    }
}

// ─── RATE LIMITER (Redis-backed) ────────────────────────────────────────────
interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetInSeconds: number;
}

export async function rateLimit(
    identifier: string,
    action: string,
    maxAttempts: number = 5,
    windowSeconds: number = 900
): Promise<RateLimitResult> {
    if (isRedisDisabled()) {
        return {
            allowed: true,
            remaining: maxAttempts,
            resetInSeconds: 0,
        };
    }

    const key = cacheKeys.rateLimit(identifier, action);

    try {
        const current = await redis.incr(key);

        if (current == 1) {
            await redis.expire(key, windowSeconds);
        }

        const ttl = await redis.ttl(key);
        const allowed = current <= maxAttempts;
        const remaining = Math.max(0, maxAttempts - current);

        return {
            allowed,
            remaining,
            resetInSeconds: ttl > 0 ? ttl : windowSeconds,
        };
    } catch (error) {
        console.error(`[RateLimit] identifier=${identifier} action=${action}`, error);
        return {
            allowed: true,
            remaining: maxAttempts,
            resetInSeconds: 0,
        };
    }
}
