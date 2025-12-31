import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteMultipleFromS3 } from "@/lib/s3";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized!!",
        },
        {
          status: 401,
        },
      );
    }

    const animations = await prisma.animation.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        videoUrl: true,
        thumbnailUrl: true,
      },
    });

    // Collect all S3 URLs to delete
    const urlsToDelete: string[] = [];
    animations.forEach((animation) => {
      if (animation.videoUrl) urlsToDelete.push(animation.videoUrl);
      if (animation.thumbnailUrl) urlsToDelete.push(animation.thumbnailUrl);
    });

    // Delete files from S3 (if any)
    if (urlsToDelete.length > 0) {
      await deleteMultipleFromS3(urlsToDelete);
    }

    // Delete user (animations will be automatically deleted due to cascade)
    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error deleting account: ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while deleting account!!",
      },
      {
        status: 500,
      },
    );
  }
}
