import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const galleryItems = await prisma.animation.findMany({
      where: {
        forGallery: true,
      },
      select: {
        id: true,
        model: true,
        prompt: true,
        code: true,
        user: true,
        videoUrl: true,
        thumbnailUrl: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!galleryItems) {
      return NextResponse.json(
        {
          success: false,
          message: "No gallery items found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Gallery data fetched successfully",
        data: galleryItems,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Error fetching gallery data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch gallery data.",
      },
      {
        status: 500,
      },
    );
  }
}
