import prisma from "@/lib/prisma";
import { getCachedData, CacheTTL, cacheKeys, setCachedData } from "@/lib/upstash-redis/cache";

export type CacheAnimations = {
    id: string;
    prompt: string;
    code: string;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    model: string | null;
    userId: string;
    createdAt: Date;
};

export async function getUserAnimations(userId: string): Promise<CacheAnimations[] | null> {
    try {
        const cacheKey = cacheKeys.userAnimations(userId);

        const cachedData = await getCachedData<CacheAnimations[]>(cacheKey);

        if (cachedData) {
            console.log("Cache Hit...");
            return cachedData;
        }

        console.log("Cache miss...");
        console.log("Getting details from the DB...");

        const animations = await prisma.animation.findMany({
            where: {
                userId,
                status: "COMPLETED",
                videoUrl: { not: null },
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                prompt: true,
                code: true,
                videoUrl: true,
                thumbnailUrl: true,
                duration: true,
                model: true,
                userId: true,
                createdAt: true,
            },
        });

        if (!animations) {
            return null;
        }
        await setCachedData(cacheKey, animations, CacheTTL.userAnimatons);

        return animations;
    } catch (error) {
        console.log("Error getting user animations: ", error);
        return null;
    }
}
