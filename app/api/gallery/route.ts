import { NextResponse } from "next/server";
import { getGalleryAnimations } from "@/helpers/galleryHelper";

export async function GET() {
  try {
    const galleryItems = await getGalleryAnimations();
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