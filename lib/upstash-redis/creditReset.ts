import prisma from "@/lib/prisma";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";

const FREE_PLAN_CREDIST = 30;

// Call this before reading or returning credits
// It checks if reset date has passed and resets if needed
export async function checkAndResetCredit(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            credits: true,
            purchasedCredits: true,
            creditsResetAt: true,
        },
    });

    if (!user) {
        return false;
    }

    const now = new Date();
    const needsReset =
        !user.creditsResetAt || // user comes first time
        now >= new Date(user.creditsResetAt); // reset date has passed

    if (!needsReset) return false;

    // calculating next reset date 30 days from now
    const nextResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // get credit limit based on plan
    const creditLimit = FREE_PLAN_CREDIST;

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            credits: creditLimit,
            creditsResetAt: nextResetAt,
        },
        select: {
            credits: true,
            purchasedCredits: true,
        },
    });

    await redis.set(cacheKeys.credits(userId), updatedUser.credits + updatedUser.purchasedCredits);
    await redis.del(cacheKeys.user(userId));

    return true;
}
