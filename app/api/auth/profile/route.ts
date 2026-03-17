import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import { getUserAnimations } from "@/helpers/animationHelpers";

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized Request",
            },
            {
                status: 402,
            }
        );
    }
    try {
        const userId = user.id;

        const animations = await getUserAnimations(userId);

        return NextResponse.json(
            {
                success: true,
                message: "Profile fetched successfully",
                data: {
                    userDetails: user,
                    animations: animations ?? [],
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error while getting the profile", error);
        return NextResponse.json({
            success: false,
            message: "Failed to get the profile",
        });
    }
}
