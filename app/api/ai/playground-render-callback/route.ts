import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        // Verify webhook secret
        const authHeader = req.headers.get("x-webhook-secret");
        const expectedSecret = process.env.WEBHOOK_SECRET;

        if (expectedSecret && authHeader !== expectedSecret) {
            console.warn("[Playground Callback] Invalid webhook secret received");
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { animation_id, success, video_url, thumbnail_url, duration, error } =
            await req.json();

        console.log("[Playground Callback] Received:", {
            animation_id,
            success,
            video_url: video_url ? "present" : "missing",
            error,
        });

        if (!animation_id) {
            return NextResponse.json(
                { success: false, message: "Animation ID is required" },
                { status: 400 },
            );
        }

        if (success) {
            // Update animation with video data
            await prisma.animation.update({
                where: { id: animation_id },
                data: {
                    status: "COMPLETED",
                    videoUrl: video_url,
                    thumbnailUrl: thumbnail_url,
                    duration: duration,
                    renderCompletedAt: new Date(),
                },
            });

            console.log(
                `[Playground Callback] Animation ${animation_id} completed successfully`,
            );

            return NextResponse.json({
                success: true,
                message: "Animation updated successfully",
            });
        } else {
            // Update to failed status
            await prisma.animation.update({
                where: { id: animation_id },
                data: {
                    status: "FAILED",
                    errorMessage: error || "Video rendering failed",
                    renderCompletedAt: new Date(),
                },
            });

            console.log(
                `[Playground Callback] Animation ${animation_id} failed: ${error}`,
            );

            return NextResponse.json({
                success: true,
                message: "Animation marked as failed",
            });
        }
    } catch (error: any) {
        console.error("[Playground Callback] Error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 },
        );
    }
}
