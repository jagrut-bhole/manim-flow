import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { generateManimCode, LLMProvider } from "@/lib/llm/provider";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { prompt, provider } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid prompt",
        },
        { status: 400 },
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
        },
      );
    }

    const result = await generateManimCode(prompt, provider as LLMProvider);

    if (!result.success || !result.code) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to generate the code",
        },
        {
          status: 500,
        },
      );
    }

    const amimation = await prisma.animation.create({
      data: {
        userId: session.user.id,
        prompt: prompt,
        code: result.code,
        status: "GENERATING",
        model: result.model || "unknown",
      },
    });

    if (!amimation) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create animation record",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        animationId: amimation.id,
        code: result.code,
        model: result.model,
        provider: result.provider,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (error) {
    console.error("Generate code error: ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while generating code",
      },
      {
        status: 500,
      },
    );
  }
}
