import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import { getUserAnimations } from "@/helpers/animationHelpers";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedUser();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized Request"
        },
        {
          status: 402
        }
      )
    }

    const userId = session.id;

    const animations = await getUserAnimations(userId);

    return NextResponse.json(
      {
        success: true,
        message: "Profile fetched successfully",
        data: {
          animations: animations ?? []
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error while getting the profile", error);
    return NextResponse.json({
      success: false,
      message: "Failed to get the profile",
    });
  }
}
