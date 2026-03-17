import prisma from "@/lib/prisma";
import { getCachedData, setCachedData, CacheTTL, cacheKeys } from "@/lib/upstash-redis/cache";
import { auth } from "@/lib/auth";
import { checkAndResetCredit } from "@/lib/upstash-redis/creditReset";
import { redis } from "@/lib/upstash-redis/redis";

export type CacheUser = {
    id: string;
    email: string;
    name: string;
    credits: number;
    creditsResetAt: Date | null;
    createdAt: Date | null;
};

export async function getAuthenticatedUser(): Promise<CacheUser | null> {
    try {
        const session = await auth();

        if (!session?.user) {
            return null;
        }

        const userId = session.user.id;
        const cacheKey = cacheKeys.user(userId);

        const cacheUser = await getCachedData<CacheUser>(cacheKey);

        if (cacheUser) {
            console.log("Cache Hitt...");
            return cacheUser;
        }

        console.log("Cache Miss...");
        console.log("Getting details from the user");

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                credits: true,
                purchasedCredits: true,
                creditsResetAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return null;
        }

        const userWithTotalCredits = {
            ...user,
            credits: user.credits + user.purchasedCredits,
        };

        await setCachedData(cacheKey, userWithTotalCredits, CacheTTL.user);

        return userWithTotalCredits;
    } catch (error) {
        console.log("Error getting authenticated user: ", error);
        return null;
    }
}

export async function getUserCredits(userId: string) {
    try {
        await checkAndResetCredit(userId);

        const cacheKey = cacheKeys.credits(userId);
        const cachedData = await getCachedData<number>(cacheKey);

        if (cachedData !== null) {
            console.log("Cache Hitt...");

            const resetAt = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    creditsResetAt: true,
                    credits: true,
                    purchasedCredits: true,
                },
            });
            return {
                credits: cachedData,
                creditsResetAt: resetAt?.creditsResetAt ?? null,
            };
        }

        console.log("Cache Miss...");
        console.log("Getting credits from the DB: ");

        const userCredits = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                credits: true,
                purchasedCredits: true,
                creditsResetAt: true,
            },
        });

        if (!userCredits) {
            return null;
        }

        const totalCredits = userCredits.credits + userCredits.purchasedCredits;

        await redis.set(cacheKey, totalCredits);

        return {
            credits: totalCredits,
            creditsResetAt: userCredits.creditsResetAt,
        };
    } catch (error) {
        console.log("Error getting user credits: ", error);
        return null;
    }
}
