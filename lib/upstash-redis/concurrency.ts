import { redis } from "./redis";

const MAX_CONCURRENT_RENDERS = 2;
const ACTIVE_RENDERS_KEY = "renders:active"; // global counter
const RENDER_TTL = 60 * 15; // 15 min safety TTL per user lock
const COUNTER_TTL = 60 * 20; // 20 min safety TTL on global counter — prevents permanent stuck state

export interface ConcurrencyCheckResult {
    allowed: boolean;
    activeRenders: number;
    maxRenders: number;
    position?: number; // queue position if not allowed
    retryAfterSeconds?: number;
}

// Check + acquire slot
export async function acquireRenderSlot(userId: string): Promise<ConcurrencyCheckResult> {
    try {
        const userRenderKey = `rendering:${userId}`;

        // Check if this user already has an active render lock
        const userAlreadyRendering = await redis.get(userRenderKey);
        if (userAlreadyRendering) {
            return {
                allowed: false,
                activeRenders: MAX_CONCURRENT_RENDERS,
                maxRenders: MAX_CONCURRENT_RENDERS,
                position: 1,
                retryAfterSeconds: 30,
            };
        }

        // Atomically increment and grab the new count
        const activeCount = await redis.incr(ACTIVE_RENDERS_KEY);

        // Refresh TTL on every increment so the counter can't get permanently stuck.
        // Even if every callback fails, this will expire after COUNTER_TTL.
        await redis.expire(ACTIVE_RENDERS_KEY, COUNTER_TTL);

        if (activeCount > MAX_CONCURRENT_RENDERS) {
            // Over limit — decrement back and reject
            await redis.decr(ACTIVE_RENDERS_KEY);

            const position = activeCount - MAX_CONCURRENT_RENDERS;
            const retryAfterSeconds = position * 30;

            return {
                allowed: false,
                activeRenders: activeCount - 1,
                maxRenders: MAX_CONCURRENT_RENDERS,
                position,
                retryAfterSeconds,
            };
        }

        // Slot acquired — lock this user with a safety TTL
        await redis.set(userRenderKey, "1", { ex: RENDER_TTL });

        return {
            allowed: true,
            activeRenders: activeCount,
            maxRenders: MAX_CONCURRENT_RENDERS,
        };
    } catch (error) {
        console.error("[Concurrency] acquireRenderSlot error:", error);
        // Fail open — if Redis is down, let the render through
        return {
            allowed: true,
            activeRenders: 0,
            maxRenders: MAX_CONCURRENT_RENDERS,
        };
    }
}

// Release the slot when render COMPLETES OR FAILS
export async function releaseRenderSlot(userId: string): Promise<void> {
    try {
        const userRenderKey = `rendering:${userId}`;

        // Remove user lock
        await redis.del(userRenderKey);

        // Decrement global counter — never go below 0
        const current = await redis.get<number>(ACTIVE_RENDERS_KEY);
        if (current && current > 0) {
            await redis.decr(ACTIVE_RENDERS_KEY);
        } else {
            await redis.set(ACTIVE_RENDERS_KEY, 0);
        }

        console.log(`[Concurrency] Slot released for userId=${userId}`);
    } catch (error) {
        console.error("[Concurrency] releaseRenderSlot error:", error);
    }
}

// GET current active renders count
export async function getActiveRendersCount(): Promise<number> {
    try {
        const count = await redis.get<number>(ACTIVE_RENDERS_KEY);
        return count ?? 0;
    } catch (error) {
        console.error("[Concurrency] getActiveRendersCount error:", error);
        return 0;
    }
}

// Hard-reset all concurrency state — use via /api/test when counter is stuck
export async function resetConcurrencyState(): Promise<void> {
    try {
        await redis.set(ACTIVE_RENDERS_KEY, 0);
        console.log("[Concurrency] State hard-reset to 0");
    } catch (error) {
        console.error("[Concurrency] resetConcurrencyState error:", error);
    }
}
