import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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

    const response = await fetch(`${PYTHON_SERVICE_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        quality,
      }),
    });

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
        videoUrl: `${PYTHON_SERVICE_URL}${result.video_url}`,
        thumbnailUrl: result.thumbnail_url
          ? `${PYTHON_SERVICE_URL}${result.thumbnail_url}`
          : null,
        duration: result.duration,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Video rendered successfully",
        data: {
          animationId,
          videoUrl: `${PYTHON_SERVICE_URL}${result.video_url}`,
          thumbnailUrl: result.thumbnail_url
            ? `${PYTHON_SERVICE_URL}${result.thumbnail_url}`
            : null,
          duration: result.duration,
        },
      },
      {
        status: 200,
      },
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
      },
    );
  }
}
