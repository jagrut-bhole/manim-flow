import prisma from "@/lib/prisma";
import { getCachedData, CacheTTL, cacheKeys, setCachedData } from "@/lib/upstash-redis/cache";

export type cacheGalleryAnimations = {
    id: string;
    model: string;
    prompt: string;
    code: string;
    userId: string;
    videoUrl: string | null;
    thumbnailUrl: string | null;
}

export async function getGalleryAnimations() {
    try {
        const cacheKey = cacheKeys.animation("gallery");

        const cachedData = await getCachedData<cacheGalleryAnimations[]>(cacheKey);

        if(cachedData) {
            console.log("Cache Hittt...");
            return cachedData;
        }

        console.log("Cache Miss...");
        console.log("Getting animations from the DB: ");

        const animations = await prisma.animation.findMany({
            where: {
                forGallery: true,
            }, 
            select: {
                id: true,
                model: true,
                prompt: true,
                code: true,
                userId: true,
                videoUrl: true,
                thumbnailUrl: true,
            },
            orderBy: {
                updatedAt: "desc",
            }
        })

        if(!animations) {
            return null;
        }

        await setCachedData(cacheKey, animations, CacheTTL.animation);

        return animations;
    } catch (error) {
        console.log("Error fetching gallery data:", error);
        return null;
    }
}