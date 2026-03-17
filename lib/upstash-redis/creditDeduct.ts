import prisma from "@/lib/prisma";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";

const MONTHLY_CREDIT_LIMIT = 30;

export const CREDIT_COSTS = {
    CODE_GENERATION: 1,
    VIDEO_GENERATION: 2,
};

export type CreditAction = keyof typeof CREDIT_COSTS;

type DeductionMetadata = {
    amount: number;
    monthlyDeducted: number;
    purchasedDeducted: number;
};

export type DeductResult =
    | { success: true; remaining: number }
    | {
          success: false;
          reason: "insufficient_credits" | "user_not_found";
          credits: number;
      };

function getDeductionMetaKey(userId: string, reference: string): string {
    return `credit_deduction:${userId}:${reference}`;
}

async function syncCreditCache(userId: string, totalCredits: number): Promise<void> {
    await redis.set(cacheKeys.credits(userId), totalCredits);
    await redis.del(cacheKeys.user(userId));
}

async function persistDeductionMetadata(
    userId: string,
    reference: string,
    metadata: DeductionMetadata
): Promise<void> {
    await redis.set(getDeductionMetaKey(userId, reference), metadata, { ex: 60 * 60 * 24 });
}

async function readDeductionMetadata(
    userId: string,
    reference: string
): Promise<DeductionMetadata | null> {
    return await redis.get<DeductionMetadata>(getDeductionMetaKey(userId, reference));
}

async function clearDeductionMetadata(userId: string, reference: string): Promise<void> {
    await redis.del(getDeductionMetaKey(userId, reference));
}

export async function deductCreditAmount(
    userId: string,
    amount: number,
    reference: string
): Promise<DeductResult> {
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { credits: true, purchasedCredits: true },
        });

        if (!user) {
            return {
                success: false as const,
                reason: "user_not_found" as const,
                credits: 0,
            };
        }

        const totalCredits = user.credits + user.purchasedCredits;

        if (totalCredits < amount) {
            return {
                success: false as const,
                reason: "insufficient_credits" as const,
                credits: totalCredits,
            };
        }

        const monthlyDeducted = Math.min(user.credits, amount);
        const purchasedDeducted = amount - monthlyDeducted;

        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                credits: { decrement: monthlyDeducted },
                purchasedCredits: { decrement: purchasedDeducted },
            },
            select: { credits: true, purchasedCredits: true },
        });

        return {
            success: true as const,
            remaining: updatedUser.credits + updatedUser.purchasedCredits,
            metadata: {
                amount,
                monthlyDeducted,
                purchasedDeducted,
            },
        };
    });

    if (!result.success) {
        return result;
    }

    await persistDeductionMetadata(userId, reference, result.metadata);
    await syncCreditCache(userId, result.remaining);

    return {
        success: true,
        remaining: result.remaining,
    };
}

export async function deductCredits(
    userId: string,
    action: CreditAction,
    reference: string = action
): Promise<DeductResult> {
    return deductCreditAmount(userId, CREDIT_COSTS[action], reference);
}

export async function refundCreditAmount(
    userId: string,
    amount: number,
    reference: string
): Promise<void> {
    const metadata = await readDeductionMetadata(userId, reference);

    const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { credits: true, purchasedCredits: true },
        });

        if (!user) {
            return null;
        }

        if (metadata) {
            const monthlyRoom = Math.max(0, MONTHLY_CREDIT_LIMIT - user.credits);
            const monthlyRefund = Math.min(metadata.monthlyDeducted, monthlyRoom);
            const purchasedRefund =
                metadata.purchasedDeducted + (metadata.monthlyDeducted - monthlyRefund);

            return await tx.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: monthlyRefund },
                    purchasedCredits: { increment: purchasedRefund },
                },
                select: { credits: true, purchasedCredits: true },
            });
        }

        const monthlyRoom = Math.max(0, MONTHLY_CREDIT_LIMIT - user.credits);
        const monthlyRefund = Math.min(amount, monthlyRoom);
        const purchasedRefund = amount - monthlyRefund;

        return await tx.user.update({
            where: { id: userId },
            data: {
                credits: { increment: monthlyRefund },
                purchasedCredits: { increment: purchasedRefund },
            },
            select: { credits: true, purchasedCredits: true },
        });
    });

    if (!updatedUser) {
        return;
    }

    await clearDeductionMetadata(userId, reference);
    await syncCreditCache(userId, updatedUser.credits + updatedUser.purchasedCredits);
}

export async function refundCredits(
    userId: string,
    action: CreditAction,
    reference: string = action
): Promise<void> {
    await refundCreditAmount(userId, CREDIT_COSTS[action], reference);
    console.log(`[Credits] Refunded ${CREDIT_COSTS[action]} credits to userId=${userId}`);
}
