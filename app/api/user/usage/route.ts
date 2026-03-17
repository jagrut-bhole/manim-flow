import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import { UsageResponse } from "./usageSchema";
export async function GET(request: NextRequest): Promise<NextResponse<UsageResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized request",
                },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const source = searchParams.get("source");
        const fromDate = searchParams.get("from");
        const toDate = searchParams.get("to");

        const whereClause: {
            userId: string;
            prompt?: { contains: string; mode: "insensitive" };
            source?: "WEBSITE" | "API" | "PLAYGROUND";
            createdAt?: { gte?: Date; lte?: Date };
        } = { userId: user.id };

        if (search) {
            whereClause.prompt = { contains: search, mode: "insensitive" };
        }

        if (source && ["WEBSITE", "API", "PLAYGROUND"].includes(source)) {
            whereClause.source = source as "WEBSITE" | "API" | "PLAYGROUND";
        }

        if (fromDate || toDate) {
            const createdAtFilter: { gte?: Date; lte?: Date } = {};
            if (fromDate) createdAtFilter.gte = new Date(fromDate);
            if (toDate) createdAtFilter.lte = new Date(toDate);
            whereClause.createdAt = createdAtFilter;
        }

        const skip = (page - 1) * limit;

        const [userRecord, animations, totalAnimations] = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.id },
                select: { credits: true, purchasedCredits: true, creditsResetAt: true },
            }),
            prisma.animation.findMany({
                where: whereClause,
                select: {
                    id: true,
                    status: true,
                    source: true,
                    prompt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.animation.count({ where: whereClause }),
        ]);

        if (!userRecord) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        const mappedAnimations = animations.map((anim) => {
            return {
                id: anim.id,
                status: anim.status,
                source: anim.source,
                prompt: anim.prompt,
                createdAt: anim.createdAt.toISOString(),
                creditsSpent: 2, // Average credits spent for video generation
            };
        });

        return NextResponse.json(
            {
                success: true,
                message: "User usage fetched successfully",
                data: {
                    credits: userRecord.credits + userRecord.purchasedCredits,
                    creditsResetAt: userRecord.creditsResetAt
                        ? userRecord.creditsResetAt.toISOString()
                        : null,
                    animations: mappedAnimations,
                    pagination: {
                        total: totalAnimations,
                        page,
                        limit,
                        totalPages: Math.ceil(totalAnimations / limit),
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error fetching user usage:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}
