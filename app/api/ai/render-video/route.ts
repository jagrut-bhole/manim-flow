import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";

// Credits Part
import { deductCredits, refundCredits } from "@/lib/upstash-redis/creditDeduct";

// Concurrency Part
import {
    acquireRenderSlot,
    releaseRenderSlot,
    getActiveRendersCount,
} from "@/lib/upstash-redis/concurrency";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FREE_QUALITY = "l";
const PRO_QUALITY = ["l", "m", "h"];

export async function POST(req: NextRequest) {
    // AUTH
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    // PARSING THE REQUEST BODY
    const { animationId, code, quality: requestedQuality } = await req.json();

    if (!animationId || !code) {
        return NextResponse.json(
            {
                success: false,
                message: "Animation ID and code are required",
            },
            {
                status: 400,
            }
        );
    }

    // Quality check based on the user's plan
    let quality: string;

    // if (user.plan === "PRO") {
    //     quality =
    //         requestedQuality && PRO_QUALITY.includes(requestedQuality) ? requestedQuality : "h";
    // } else {
    //     quality = FREE_QUALITY;
    // }

    quality = FREE_QUALITY;

    // Concurrency Check before deducting users credit so we don't waste users credit if server full
    const slot = await acquireRenderSlot(user.id);

    if (!slot.allowed) {
        return NextResponse.json(
            {
                success: false,
                message: "Server is busy",
                busy: true,
                position: slot.position,
                retryAfterSeconds: slot.retryAfterSeconds,
                activeRenders: slot.activeRenders,
                maxRenders: slot.maxRenders,
            },
            {
                status: 429,
            }
        );
    }

    // Credits Deduction Part - atomically
    const deduction = await deductCredits(user.id, "VIDEO_GENERATION");

    if (!deduction.success) {
        return NextResponse.json({
            success: false,
            message: `Insufficient_Credits. You need 2 credit and you have ${deduction.credits} remaining`,
            credits: deduction.credits,
        });
    }

    try {
        // RENDERING STARTS 👇
        // Update status to RENDERING
        await prisma.animation.update({
            where: {
                id: animationId,
            },
            data: {
                status: "RENDERING",
            },
        });

        // Construct webhook URL - prioritize NEXT_PUBLIC_APP_URL for production
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
            req.headers.get("origin") ||
            "http://localhost:3000";

        const webhookUrl = `${baseUrl}/api/ai/render-callback`;

        console.log("[Render] Webhook URL for animation:", animationId, "->", webhookUrl);
        console.log(
            "[Render] Environment check - NEXT_PUBLIC_APP_URL:",
            process.env.NEXT_PUBLIC_APP_URL || "not set"
        );
        console.log(
            "[Render] Environment check - VERCEL_URL:",
            process.env.VERCEL_URL || "not set"
        );

        // not to await - let it run in background
        fetch(`${PYTHON_SERVICE_URL}/execute-async`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                quality,
                animation_id: animationId,
                webhook_url: webhookUrl,
            }),
        }).catch((fetchError) => {
            console.error("Failed to start render job:", fetchError);

            refundCredits(user.id, "VIDEO_GENERATION").catch(console.error);

            prisma.animation
                .update({
                    where: { id: animationId },
                    data: {
                        status: "FAILED",
                        errorMessage: "Failed to start rendering job",
                    },
                })
                .catch(console.error);
        });

        return NextResponse.json(
            {
                success: true,
                message: "Video rendering started. This may take several minutes.",
                data: {
                    animationId,
                    status: "RENDERING",
                    quality,
                },
            },
            {
                status: 202,
            }
        );
    } catch (error: any) {
        console.error("Render Error: ", error);
        // something went wrong after acquiring the slot so cleanup everthing
        await releaseRenderSlot(user.id);
        await refundCredits(user.id, "VIDEO_GENERATION");
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
