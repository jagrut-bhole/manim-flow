import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export const maxDuration = 60; // 1 minute is enough since we return immediately
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { animationId, code, quality = "l" } = await req.json();

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

    // Update status to RENDERING
    await prisma.animation.update({
      where: {
        id: animationId,
      },
      data: {
        status: "RENDERING",
      },
    });

    // Get the base URL for webhook callback
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/ai/render-callback`;

    // Send request to Python service with webhook (fire and forget)
    // Don't await - let it run in background
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
    }).catch((error) => {
      console.error("Failed to start render job:", error);
      // Update to failed status
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

    // Return immediately - processing will continue in background
    return NextResponse.json(
      {
        success: true,
        message: "Video rendering started. This may take several minutes.",
        data: {
          animationId,
          status: "RENDERING",
        },
      },
      {
        status: 202, // 202 Accepted
      }
    );
  } catch (error: any) {
    console.error("Render Error: ", error);
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
