import { NextResponse, NextRequest } from "next/server";
import { generateManimCode, LLMProvider } from "@/lib/llm/provider";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";
// Credits part
import { deductCredits, refundCredits } from "@/lib/upstash-redis/creditDeduct";
import { getAuthenticatedUser } from "@/helpers/authHelpers";

export async function POST(req: NextRequest) {

    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

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

    // Deduct credits atomically before anything
    const deduction = await deductCredits(user.id, "CODE_GENERATION");

    if (!deduction.success) {
        return NextResponse.json(
            {
                success: false,
                message: `Insufficient_Credits. You need 1 credit and you have ${deduction.credits} remaining`,
                credits: deduction.credits,
            },
            {
                status: 402,
            }
        );
    }

    try {
        const { prompt, provider } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid prompt",
                },
                { status: 400 }
            );
        }

        if (prompt.length < 10) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Prompt too short",
                },
                {
                    status: 400,
                }
            );
        }

        fetch(`${PYTHON_SERVICE_URL}/health`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await generateManimCode(prompt, provider as LLMProvider);

        if (!result.success || !result.code) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.error || "Failed to generate the code",
                },
                {
                    status: 500,
                }
            );
        }

        const animation = await prisma.animation.create({
            data: {
                userId: user.id,
                prompt: prompt,
                code: result.code,
                status: "GENERATING",
                model: result.model || "unknown",
            },
        });

        if (!animation) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to create animation record",
                },
                {
                    status: 500,
                }
            );
        }

        await redis.del(cacheKeys.credits(animation.userId));

        return NextResponse.json({
            success: true,
            data: {
                animationId: animation.id,
                code: result.code,
                model: result.model,
                provider: result.provider,
                tokensUsed: result.tokensUsed,
            },
        });
    } catch (error) {
        console.error("Generate code error: ", error);

        await refundCredits(user.id, "CODE_GENERATION");

        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error while generating code",
            },
            {
                status: 500,
            }
        );
    }
}
