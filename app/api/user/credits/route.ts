import { getAuthenticatedUser, getUserCredits } from "@/helpers/authHelpers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            )
        }

        const data = await getUserCredits(user.id);

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User credits not found"
                },
                {
                    status: 404
                }
            )
        }data

        const daysUntilReset =
            data.creditsResetAt
                ? Math.ceil(
                    (new Date(data.creditsResetAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                ) : 30

        return NextResponse.json(
            {
                success: true,
                message: "User credits fetched successfully",
                data: {
                    credits: data.credits,
                    creditsResetAt: data.creditsResetAt,
                    daysUntilReset: Math.max(0, daysUntilReset),
                    plan: user.plan
                }
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error getting user credits: ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            {
                status: 500
            }
        );
    }
}