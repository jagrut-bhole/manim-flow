import prisma from "@/lib/prisma";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";

const FREE_PLAN_CREDIST = 20;

// Call this before reading or returning credits
// It checks if reset date has passed and resets if needed
export async function checkAndResetCredit(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            credits: true,
            creditsResetAt: true,
            plan: true,
        }
    });

    if (!user) {
        return false;
    }

    const now = new Date();
    const needsReset =
        !user.creditsResetAt // user comes first time
            ||
        now >= new Date(user.creditsResetAt); // reset date has passed

    if (!needsReset) return false;

    // calculating next reset date 30 days from now
    const nextResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // get credit limit based on plan
    const creditLimit = getPlanCreditLimit(user.plan);

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            credits: creditLimit,
            creditsResetAt: nextResetAt
        }
    });

    await redis.set(cacheKeys.credits(userId), creditLimit);

    return true;
}

export function getPlanCreditLimit(plan: string): number {
    switch (plan) {
        case "PRO":
            return 50;
        case "ENTERPRISE":
            return 500;
        case "FREE":
        default:
            return FREE_PLAN_CREDIST;
    }
}