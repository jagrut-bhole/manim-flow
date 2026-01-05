import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const animation = await prisma.animation.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    if (!animation) {
      return NextResponse.json(
        { success: false, message: "Animation not found" },
        { status: 404 },
      );
    }

    // Calculate elapsed time for estimated completion
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(animation.createdAt).getTime()) / 1000
    );

    // Estimated render time (30-90 seconds on average)
    const estimatedTotalSeconds = 60; // Base estimate
    const estimatedRemainingSeconds = Math.max(
      0,
      estimatedTotalSeconds - elapsedSeconds
    );

    return NextResponse.json({
      success: true,
      data: {
        ...animation,
        elapsedSeconds,
        estimatedRemainingSeconds,
        isComplete: ["COMPLETED", "FAILED"].includes(animation.status),
      },
    });
  } catch (error: any) {
    console.error("Status Check Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
