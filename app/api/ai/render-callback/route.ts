import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { refundCredits } from "@/lib/upstash-redis/creditDeduct";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";
import { releaseRenderSlot } from "@/lib/upstash-redis/concurrency";

export const dynamic = "force-dynamic";
const API_V1_RENDER_REFERENCE = "API_V1_RENDER";

export async function POST(req: NextRequest) {
    try {
        // Optional: Add a secret token for security
        const authHeader = req.headers.get("x-webhook-secret");
        const expectedSecret = process.env.WEBHOOK_SECRET;

        if (expectedSecret && authHeader !== expectedSecret) {
            console.warn("Invalid webhook secret received");
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { animation_id, success, video_url, thumbnail_url, duration, error } =
            await req.json();

        console.log("Render callback received:", {
            animation_id,
            success,
            video_url: video_url ? "present" : "missing",
            error,
        });

        if (!animation_id) {
            return NextResponse.json(
                { success: false, message: "Animation ID is required" },
                { status: 400 }
            );
        }

        const animation = await prisma.animation.findUnique({
            where: {
                id: animation_id,
            },
            select: {
                userId: true,
                source: true,
            },
        });

        if (!animation) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Animation not found",
                },
                {
                    status: 404,
                }
            );
        }

        const { userId } = animation;

        // Release the render slot
        await releaseRenderSlot(userId);

        if (success) {
            await prisma.animation.update({
                where: { id: animation_id },
                data: {
                    status: "COMPLETED",
                    videoUrl: video_url,
                    thumbnailUrl: thumbnail_url,
                    duration: duration,
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

            // Invalidate animation cache so user sees fresh data
            await redis.del(cacheKeys.userAnimations(userId));

            console.log(`Animation ${animation_id} completed successfully`);

            return NextResponse.json({
                success: true,
                message: "Animation updated successfully",
            });
        } else {
            await prisma.animation.update({
                where: { id: animation_id },
                data: {
                    status: "FAILED",
                    errorMessage: error || "Video rendering failed",
                },
            });

            // Refund credits since rendering failed
            if (userId) {
                const refundReference =
                    animation.source === "API" ? API_V1_RENDER_REFERENCE : "VIDEO_GENERATION";
                await refundCredits(userId, "VIDEO_GENERATION", refundReference);
            }

            console.log(`Animation ${animation_id} failed: ${error}`);

            return NextResponse.json({
                success: true,
                message: "Animation marked as failed",
            });
        }
    } catch (error) {
        // NOTE: No refund here — we don't know if the video succeeded or failed.
        // A catch here means our own DB code failed, not that the video failed.
        console.error("Callback Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
