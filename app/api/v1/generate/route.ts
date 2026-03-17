import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKey/apiKey";
import { deductCredits, refundCredits } from "@/lib/upstash-redis/creditDeduct";
import { acquireRenderSlot, releaseRenderSlot } from "@/lib/upstash-redis/concurrency";
import { generateWithGemini } from "@/lib/llm/gemini";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Credits costs by quality
const RENDER_CREDIT_COSTS: Record<string, number> = {
    low: 2,
    // medium: 3,
    // high: 4,
};

const QUALITY_MAP: Record<string, string> = {
    low: "l",
    // medium: "m",
    // high: "h",
};

export const maxDuration = 60;
export const dynamic = "force-dynamic";
const API_V1_RENDER_REFERENCE = "API_V1_RENDER";
const API_V1_CODE_REFERENCE = "API_V1_CODE";

export async function POST(req: NextRequest) {
    // extracting the api key from the header
    const rawKey = req.headers.get("x-api-key");

    if (!rawKey) {
        return NextResponse.json(
            {
                success: false,
                error: "missing_api_key",
                message: "Provide your API key in the x-api-key header.",
            },
            {
                status: 401,
            }
        );
    }

    // validating that api key
    const keyResult = await validateApiKey(rawKey);

    if (!keyResult.valid) {
        return NextResponse.json(
            {
                success: false,
                error: "invalid_api_key",
                message: "The provided API key is invalid.",
            },
            {
                status: keyResult.status,
            }
        );
    }

    const { userId } = keyResult.data;

    // validating the request bodu
    let body: { prompt?: string; quality?: string } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "invalid_request_body",
                message: "Invalid request body",
            },
            {
                status: 400,
            }
        );
    }

    const { prompt, quality: rawQuality = "low" } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return NextResponse.json(
            {
                success: false,
                error: "missing_prompt",
                message: "Prompt is required.",
            },
            {
                status: 400,
            }
        );
    }

    if (prompt.trim().length > 100) {
        return NextResponse.json(
            {
                success: false,
                error: "prompt_too_long",
                message: "Prompt is too long. Maximum 100 characters allowed.",
            },
            {
                status: 400,
            }
        );
    }

    const quality = ["low", "medium", "high"].includes(rawQuality) ? rawQuality : "low";
    const pythonQuality = QUALITY_MAP[quality];
    const renderCost = RENDER_CREDIT_COSTS[quality];
    const totalCost = 1 + renderCost; // 1 for codegen + render cost

    // concurrency check
    const slot = await acquireRenderSlot(userId);
    if (!slot.allowed) {
        return NextResponse.json(
            {
                error: "server_busy",
                message: "Server is at capacity. Please retry shortly.",
                retryAfterSeconds: slot.retryAfterSeconds,
                position: slot.position,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(slot.retryAfterSeconds ?? 30),
                },
            }
        );
    }

    // Deduct total credits upfront
    const renderDeduction = await deductCredits(
        userId,
        "VIDEO_GENERATION",
        API_V1_RENDER_REFERENCE
    );
    if (!renderDeduction.success) {
        await releaseRenderSlot(userId);
        return NextResponse.json(
            {
                error: "insufficient_credits",
                message: `You need ${totalCost} credits for this request. You have ${renderDeduction.credits} remaining.`,
                creditsRequired: totalCost,
                creditsAvailable: renderDeduction.credits,
            },
            { status: 402 }
        );
    }

    const codeDeduction = await deductCredits(userId, "CODE_GENERATION", API_V1_CODE_REFERENCE);
    if (!codeDeduction.success) {
        await refundCredits(userId, "VIDEO_GENERATION", API_V1_RENDER_REFERENCE);
        await releaseRenderSlot(userId);
        return NextResponse.json(
            {
                error: "insufficient_credits",
                message: `You need ${totalCost} credits for this request. You have ${codeDeduction.credits} remaining.`,
                creditsRequired: totalCost,
                creditsAvailable: codeDeduction.credits,
            },
            { status: 402 }
        );
    }

    // Code Generation

    let generatedCode: string;
    try {
        const codeResult = await generateWithGemini(prompt);

        if (!codeResult.success || !codeResult.code) {
            await refundCredits(userId, "VIDEO_GENERATION", API_V1_RENDER_REFERENCE);
            await refundCredits(userId, "CODE_GENERATION", API_V1_CODE_REFERENCE);

            await releaseRenderSlot(userId);
            return NextResponse.json(
                {
                    error: "codegen_failed",
                    message: "Failed to generate animation code. Please try again.",
                },
                { status: 500 }
            );
        }

        generatedCode = codeResult.code;
    } catch {
        await refundCredits(userId, "VIDEO_GENERATION", API_V1_RENDER_REFERENCE);
        await refundCredits(userId, "CODE_GENERATION", API_V1_CODE_REFERENCE);
        await releaseRenderSlot(userId);
        return NextResponse.json(
            { error: "codegen_failed", message: "Code generation failed." },
            { status: 500 }
        );
    }

    // Animation creation + Job rows
    let animation: { id: string };

    try {
        animation = await prisma.animation.create({
            data: {
                userId,
                prompt: prompt.trim(),
                code: generatedCode,
                model: "gemini-2.5-flash",
                source: "API",
                status: "RENDERING",
            },
            select: {
                id: true,
            },
        });
    } catch {
        await refundCredits(userId, "VIDEO_GENERATION", API_V1_RENDER_REFERENCE);
        await refundCredits(userId, "CODE_GENERATION", API_V1_CODE_REFERENCE);
        await releaseRenderSlot(userId);
        return NextResponse.json(
            { error: "internal_error", message: "Failed to create job." },
            { status: 500 }
        );
    }

    // Fire render to Python server
    const webhookUrl = `${APP_URL}/api/ai/render-callback`;

    fetch(`${PYTHON_SERVICE_URL}/execute-async`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code: generatedCode,
            quality: pythonQuality,
            animation_id: animation.id,
            webhook_url: webhookUrl,
        }),
    }).catch(async (err) => {
        console.error("[API Generate] Python server unreachable:", err);

        await releaseRenderSlot(userId);
        await refundCredits(userId, "VIDEO_GENERATION", API_V1_RENDER_REFERENCE);
        await refundCredits(userId, "CODE_GENERATION", API_V1_CODE_REFERENCE);
        await prisma.animation.update({
            where: { id: animation.id },
            data: { status: "FAILED", errorMessage: "Render server unreachable" },
        });
    });

    // ─── 9. Return job ID for polling ────────────────────────────────
    return NextResponse.json(
        {
            jobId: animation.id,
            status: "queued",
            message: "Animation is being generated. Poll /api/v1/jobs/:jobId for status.",
            creditsUsed: totalCost,
            quality,
        },
        { status: 202 }
    );
}
