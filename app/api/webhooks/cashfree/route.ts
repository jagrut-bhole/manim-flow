import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/upstash-redis/redis";
import { verifyCashfreeWebhook } from "@/lib/payment/cashfree";
import { cacheKeys } from "@/lib/upstash-redis/cache";

export async function POST(req: NextRequest) {
    // read raw body
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") ?? "";
    const timestamp = req.headers.get("x-webhook-timestamp") ?? "";

    // Verifying the signature
    const isValid = verifyCashfreeWebhook(rawBody, signature, timestamp);

    if (!isValid) {
        console.log("Webhook: Invalid Signature");
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Signature",
            },
            {
                status: 400,
            }
        );
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const eventId = payload.data?.payment?.cf_payment_id?.toString();

    console.log("[Webhook] Received event:", eventType, "id:", eventId);

    // Idempotency check
    if (eventId) {
        const webhookKey = `webhook:${eventId}`;
        const alreadyProcessed = await redis.get(webhookKey);

        if (alreadyProcessed) {
            console.log("Webhook: Already processed, skipping: ", eventId);
            return NextResponse.json({
                received: true,
                message: "Already processed",
            });
        }

        // Mark as processed
        await redis.set(webhookKey, "processing", { ex: 60 * 60 * 72 });
    }

    // Handling events
    try {
        switch (eventType) {
            case "PAYMENT_SUCCESS_WEBHOOK":
                await handlePaymentSuccess(payload);
                break;

            case "PAYMENT_FAILED_WEBHOOK":
                await handlePaymentFailed(payload);
                break;

            case "PAYMENT_USER_DROPPED_WEBHOOK":
                // User closed checkout without paying — just log it
                console.log("[Webhook] User dropped payment:", payload.data?.order?.order_id);
                break;

            default:
                console.log("[Webhook] Unknown event type:", eventType);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[Webhook] Processing error:", error);
        // Still return 200 — otherwise Cashfree retries infinitely
        // Log to your error tracking (Sentry etc.) instead
        return NextResponse.json({ received: true });
    }
}

// Payment Success
async function handlePaymentSuccess(payload: {
    data?: {
        order?: { order_id?: string };
        payment?: { cf_payment_id?: string | number };
    };
}) {
    const orderId = payload.data?.order?.order_id;
    const paymentId = payload.data?.payment?.cf_payment_id?.toString();

    if (!orderId) {
        console.error("[Webhook] No order_id in payload");
        return;
    }

    // Find the pending purchase
    const purchase = await prisma.creditPurchase.findUnique({
        where: { cashfreeOrderId: orderId },
        include: { user: true },
    });

    if (!purchase) {
        console.error("[Webhook] Purchase not found for order:", orderId);
        return;
    }

    // Guard: already completed — idempotency at DB level too
    if (purchase.status === "COMPLETED") {
        console.log("[Webhook] Purchase already completed:", orderId);
        return;
    }

    // ─── Atomically add credits in DB ────────────────────────────────
    const updatedUser = await prisma.$transaction(async (tx) => {
        // Mark purchase as completed
        await tx.creditPurchase.update({
            where: { cashfreeOrderId: orderId },
            data: {
                status: "COMPLETED",
                cashfreePaymentId: paymentId,
            },
        });

        // Add credits to user (increment, not set — so existing credits are preserved)
        return tx.user.update({
            where: { id: purchase.userId },
            data: {
                purchasedCredits: { increment: purchase.credits },
            },
            select: { credits: true, purchasedCredits: true },
        });
    });

    // ─── Sync new credit balance to Redis ────────────────────────────
    await redis.set(
        cacheKeys.credits(purchase.userId),
        updatedUser.credits + updatedUser.purchasedCredits
    );

    // Invalidate user cache so navbar refreshes
    await redis.del(cacheKeys.user(purchase.userId));

    console.log(
        `[Webhook] ✓ Added ${purchase.credits} purchased credits to userId=${purchase.userId}. New balance: ${updatedUser.credits + updatedUser.purchasedCredits}`
    );
}

// Payment Failed
async function handlePaymentFailed(payload: { data?: { order?: { order_id?: string } } }) {
    const orderId = payload.data?.order?.order_id;

    if (!orderId) return;

    await prisma.creditPurchase.updateMany({
        where: {
            cashfreeOrderId: orderId,
            status: "PENDING", // only update if still pending
        },
        data: { status: "FAILED" },
    });

    console.log("[Webhook] Payment failed for order:", orderId);
}
