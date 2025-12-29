import { authOptions } from "../[...nextauth]/options";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
      include: {
        animations: {
          select: {
            id: true,
            code: true,
            videoUrl: true,
            createdAt: true,
            thumbnailUrl: true,
            model: true,
            duration: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile fetched successfully",
        data: user,
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
