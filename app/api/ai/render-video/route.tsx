import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// Configure route to allow longer execution time
export const maxDuration = 600; // 10 minutes (requires Pro plan or higher on Vercel)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
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
        },
      );
    }

    await prisma.animation.update({
      where: {
        id: animationId,
      },
      data: {
        status: "RENDERING",
      },
    });

    // Use fetch with increased timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

    try {
      const response = await fetch(`${PYTHON_SERVICE_URL}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, quality }),
        signal: controller.signal,
        // @ts-ignore - Next.js fetch extensions
        keepalive: true,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to render video");
      }

      const result = await response.json();

      await prisma.animation.update({
        where: {
          id: animationId,
        },
        data: {
          status: "COMPLETED",
          videoUrl: result.video_url,
          thumbnailUrl: result.thumbnail_url,
          duration: result.duration,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Video rendered successfully",
          data: {
            animationId,
            videoUrl: result.video_url,
            thumbnailUrl: result.thumbnail_url,
            duration: result.duration,
          },
        },
        {
          status: 200,
        },
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Update animation status to failed
      await prisma.animation.update({
        where: { id: animationId },
        data: { 
          status: "FAILED",
          errorMessage: fetchError.name === 'AbortError' 
            ? "Video generation timed out. Please try with a simpler animation." 
            : fetchError.message 
        },
      });
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Render Error: ", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
