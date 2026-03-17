import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey } from "@/lib/apiKey/apiKey";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
    // Validate Api Key
    const rawKey = req.headers.get("x-api-key");

    if (!rawKey) {
        return NextResponse.json(
            {
                success: false,
                error: "missing_api_key",
                message: "Provide your API key in x-api-key header",
            },
            {
                status: 401,
            }
        );
    }
    const keyResult = await validateApiKey(rawKey);

    if (!keyResult.valid) {
        return NextResponse.json(
            {
                success: false,
                error: "invalid_api_key",
                message: keyResult.error,
            },
            {
                status: keyResult.status,
            }
        );
    }

    const { userId } = keyResult.data;
    const { jobId } = await params;

    // fetching the animation
    const animation = await prisma.animation.findUnique({
        where: {
            id: jobId,
        },
        select: {
            id: true,
            userId: true,
            status: true,
            prompt: true,
            videoUrl: true,
            thumbnailUrl: true,
            duration: true,
            errorMessage: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!animation) {
        return NextResponse.json(
            {
                success: false,
                error: "forbidden",
                message: "You do not have access to this job.",
            },
            {
                status: 403,
            }
        );
    }

    // Security — only owner can poll
    if (animation.userId !== userId) {
        return NextResponse.json(
            { error: "forbidden", message: "You do not have access to this job." },
            { status: 403 }
        );
    }

    // ─── 4. Map status to API-friendly format ────────────────────────
    const statusMap: Record<string, string> = {
        GENERATING: "processing",
        RENDERING: "processing",
        COMPLETED: "completed",
        FAILED: "failed",
    };

    const apiStatus = statusMap[animation.status] ?? "processing";

    // ─── 5. Build response based on status ───────────────────────────
    const response: Record<string, any> = {
        jobId: animation.id,
        status: apiStatus,
        prompt: animation.prompt,
        createdAt: animation.createdAt,
        updatedAt: animation.updatedAt,
    };

    if (apiStatus === "completed") {
        response.videoUrl = animation.videoUrl;
        response.thumbnailUrl = animation.thumbnailUrl;
        response.duration = animation.duration;
    }

    if (apiStatus === "failed") {
        response.error = animation.errorMessage || "Rendering failed";
    }

    if (apiStatus === "processing") {
        response.message = "Animation is still being processed. Poll again in a few seconds.";
    }

    return NextResponse.json(response);
}
