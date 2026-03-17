import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";
import { getCashfreeBaseUrl } from "@/lib/payment/cashfree";

// ─── Webhook fallback: verify with Cashfree directly and credit the user ───────
async function settlePendingOrder(orderId: string) {
    // Check Cashfree for the real payment status
    const cfRes = await fetch(`${getCashfreeBaseUrl}/orders/${orderId}/payments`, {
        headers: {
            "x-api-version": "2023-08-01",
            "x-client-id": process.env.CASHFREE_APP_ID!,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        },
    });

    if (!cfRes.ok) return null;

    const payments: Array<{ payment_status?: string; cf_payment_id?: string | number }> =
        await cfRes.json();

    // Find the successful payment entry
    const successfulPayment = payments.find((p) => p.payment_status === "SUCCESS");

    if (!successfulPayment) return null;

    // Re-fetch the purchase (with userId) for the transaction
    const purchase = await prisma.creditPurchase.findUnique({
        where: { cashfreeOrderId: orderId },
    });

    if (!purchase || purchase.status === "COMPLETED") return purchase;

    // Atomically mark COMPLETED + add credits
    const updatedUser = await prisma.$transaction(async (tx) => {
        await tx.creditPurchase.update({
            where: { cashfreeOrderId: orderId },
            data: {
                status: "COMPLETED",
                cashfreePaymentId: successfulPayment.cf_payment_id?.toString(),
            },
        });

        return tx.user.update({
            where: { id: purchase.userId },
            data: { purchasedCredits: { increment: purchase.credits } },
            select: { credits: true, purchasedCredits: true },
        });
    });

    // Sync Redis cache
    await redis.set(
        cacheKeys.credits(purchase.userId),
        updatedUser.credits + updatedUser.purchasedCredits
    );
    await redis.del(cacheKeys.user(purchase.userId));

    console.log(
        `[StatusRoute] Fallback settled: +${purchase.credits} purchased credits for userId=${purchase.userId}. Balance: ${updatedUser.credits + updatedUser.purchasedCredits}`
    );

    return { ...purchase, status: "COMPLETED" };
}

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "UnAuthorized Request" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order_id is required" },
                { status: 400 }
            );
        }

        // Verify ownership first
        const ownership = await prisma.creditPurchase.findFirst({
            where: { cashfreeOrderId: orderId, userId: user.id },
        });

        if (!ownership) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Find the purchase
        let purchase = await prisma.creditPurchase.findUnique({
            where: { cashfreeOrderId: orderId },
            select: {
                status: true,
                credits: true,
                amountPaid: true,
                user: { select: { credits: true, purchasedCredits: true } },
            },
        });

        if (!purchase) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        // ── Webhook fallback: if still PENDING, ask Cashfree directly ─────
        if (purchase.status === "PENDING") {
            const settled = await settlePendingOrder(orderId);

            if (settled) {
                // Re-read fresh data after settlement
                purchase = await prisma.creditPurchase.findUnique({
                    where: { cashfreeOrderId: orderId },
                    select: {
                        status: true,
                        credits: true,
                        amountPaid: true,
                        user: { select: { credits: true, purchasedCredits: true } },
                    },
                });
            }
        }

        return NextResponse.json({
            status: purchase!.status,
            credits: purchase!.credits,
            currentBalance: purchase!.user.credits + purchase!.user.purchasedCredits,
        });
    } catch (error) {
        console.log("Error in payment status route", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
