import prisma from "@/lib/prisma";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";

export const CREDIT_COSTS = {
    CODE_GENERATION: 1,
    VIDEO_GENERATION: 2,
}

export type CreditAction = keyof typeof CREDIT_COSTS;

export type DeductResult =
    | { success: true; remaining: number; }
    | { success: false; reason: "insufficient_credits" | "user_not_found"; credits: number };


// ─── DEDUCT ────────────────────────────────────────────────────────────────
export async function deductCredits(
    userId: string,
    action: CreditAction,
): Promise<DeductResult> {
    const cost = CREDIT_COSTS[action];
    const key = cacheKeys.credits(userId);

    // Atomically deduct from Redis as decrby is atomic so race condition
    const remaining = await redis.decrby(key, cost);

    if (remaining < 0) {
        // if negative then refund immediately and reject the request
        await redis.incrby(key, cost);

        const actual = await redis.get<number>(key);

        return {
            success: false,
            reason: "insufficient_credits",
            credits: actual ?? 0,
        };

    }
    syncCreditsToDb(userId, remaining).catch((err: any) =>
        console.error(`[Credits] DB sync failed userId=${userId}`, err)
    );

    return { success: true, remaining };
}

// ─── REFUND ────────────────────────────────────────────────────────────────
// Call this if the operation fails AFTER credits were deducted

export async function refundCredits(
    userId: string,
    action: CreditAction
): Promise<void> {
    const cost = CREDIT_COSTS[action];
    const key = cacheKeys.credits(userId);

    await redis.incrby(key, cost);

    // Sync refund to DB
    const remaining = await redis.get<number>(key);
    if (remaining !== null) {
        await syncCreditsToDb(userId, remaining);
    }

    console.log(`[Credits] Refunded ${cost} credits to userId=${userId}`);
}

// ─── SYNC TO DB ─────────────────────────────────────────────────────────────
// Keeps Postgres in sync with Redis — called async after deduct/refund
async function syncCreditsToDb(userId: string, credits: number): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { credits },
    });
}``