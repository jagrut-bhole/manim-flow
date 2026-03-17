import { redis } from "@/lib/upstash-redis/redis";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import { NextResponse } from "next/server";
import { cacheKeys } from "@/lib/upstash-redis/cache";
import { resetConcurrencyState } from "@/lib/upstash-redis/concurrency";

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 1. Clear user profile cache
        await redis.del(cacheKeys.user(user.id));
        // 2. Clear credits cache (forces re-seed from DB on next operation)
        await redis.del(cacheKeys.credits(user.id));
        // 3. Clear this user's render lock (in case it got stuck)
        await redis.del(cacheKeys.activeRender(user.id));
        // 4. Reset the global active renders counter (in case it got stuck)
        await resetConcurrencyState();

        return NextResponse.json({
            success: true,
            message: "All Redis state cleared (user, credits, render lock, concurrency counter)",
            userId: user.id,
        });
    } catch (error) {
        console.error("Error clearing Redis state:", error);
        return NextResponse.json(
            { success: false, message: "Failed to clear Redis state" },
            { status: 500 }
        );
    }
}
