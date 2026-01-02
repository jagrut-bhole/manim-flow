import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
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
      },
    });

    if (!animation) {
      return NextResponse.json(
        { success: false, message: "Animation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: animation,
    });
  } catch (error: any) {
    console.error("Status Check Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
