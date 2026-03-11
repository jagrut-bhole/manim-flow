import prisma from "@/lib/prisma";
import {
    getCachedData,
    setCachedData,
    CacheTTL,
    cacheKeys,
} from "@/lib/upstash-redis/cache";
import { auth } from "@/lib/auth";

export type CacheUser = {
    id: string;
    email: string;
    name: string;
    credits: Number;
    plan: string;
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
                plan: true,
            },
        });

        if (!user) {
            return null;
        }

        await setCachedData(cacheKey, user, CacheTTL.user);

        return user;
    } catch (error) {
        console.log("Error getting authenticated user: ", error);
        return null;
    }
}
