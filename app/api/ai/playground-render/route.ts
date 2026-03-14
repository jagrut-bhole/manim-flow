import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";

// Credits Part
import { deductCredits, refundCredits } from "@/lib/upstash-redis/creditDeduct";

const PYTHON_SERVICE_URL =
    process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {

    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized Request"
            },
            {
                status: 401
            }
        )
    }

    const deduction = await deductCredits(user.id, "VIDEO_GENERATION");

    if (!deduction.success) {
        return NextResponse.json(
            {
                success: false,
                message: "Insufficient_Credits. You need 2 credits and you have ${deduction.credits} remaining",
                credits: deduction.credits
            },
            {
                status: 402
            }
        )
    }

    try {
        const session = await getAuthenticatedUser();

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        const { code, quality = "l" } = await req.json();

        if (!code) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Code is required",
                },
                { status: 400 },
            );
        }

        // Create animation record with RENDERING status and PLAYGROUND source
        const animation = await prisma.animation.create({
            data: {
                userId: session.id,
                prompt: "Playground render",
                code,
                source: "PLAYGROUND",
                status: "RENDERING",
                renderStartedAt: new Date(),
            },
        });

        // Construct webhook URL
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : null) ||
            req.headers.get("origin") ||
            "http://localhost:3000";

        const webhookUrl = `${baseUrl}/api/ai/playground-render-callback`;

        console.log(
            "[Playground Render] Webhook URL for animation:",
            animation.id,
            "->",
            webhookUrl,
        );

        // Fire-and-forget: send to Python service
        fetch(`${PYTHON_SERVICE_URL}/execute-async`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                quality,
                animation_id: animation.id,
                webhook_url: webhookUrl,
            }),
        }).catch((fetchError) => {
            console.error("[Playground Render] Failed to start render job:", fetchError);

            refundCredits(user.id, "VIDEO_GENERATION").catch(console.error);

            prisma.animation
                .update({
                    where: { id: animation.id },
                    data: {
                        status: "FAILED",
                        errorMessage: "Failed to start rendering job",
                    },
                })
                .catch(console.error);
        });

        // Return immediately with animation ID so frontend can redirect
        return NextResponse.json(
            {
                success: true,
                message: "Video rendering started. This may take several minutes.",
                data: {
                    animationId: animation.id,
                    status: "RENDERING",
                },
            },
            { status: 202 },
        );
    } catch (error: any) {
        console.error("[Playground Render] Error:", error);

        await refundCredits(user.id, "VIDEO_GENERATION");

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 },
        );
    }
}
