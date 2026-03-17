import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/helpers/authHelpers";
import { NextResponse, NextRequest } from "next/server";
import { redis } from "@/lib/upstash-redis/redis";
import { cacheKeys } from "@/lib/upstash-redis/cache";
import {
    createCashfreeOrder,
    generateOrderId,
    CREDIT_PACKS,
    type CreditPackKey,
} from "@/lib/payment/cashfree";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
    try {
        // checking user session
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized Request",
                },
                {
                    status: 401,
                }
            );
        }

        //Validate Pack

        const { pack = "PACK_30" }: { pack: CreditPackKey } = await req.json();

        if (!CREDIT_PACKS[pack]) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid Pack Selected",
                },
                {
                    status: 400,
                }
            );
        }

        const selectedPack = CREDIT_PACKS[pack];

        // Idempotency -> to prevent duplicate orders
        const tenMinuteWindow = Math.floor((Date.now() / 1000) * 50 * 10);
        const idempotencyKey = `idempotency:order:${user.id}:${pack}:${tenMinuteWindow}`;

        const existingOrderId = await redis.get<string>(idempotencyKey);

        // already created an order recently - so fetch and return it
        if (existingOrderId) {
            const existingPurchase = await prisma.creditPurchase.findUnique({
                where: {
                    cashfreeOrderId: existingOrderId,
                },
                select: {
                    cashfreeOrderId: true,
                },
            });

            if (existingPurchase) {
                console.log("[CreateOrder] Returning existing order:", existingOrderId);

                // re-create session for this existing user
                const orderDetails = await fetch(
                    `${process.env.CASHFREE_BASE_URL}/orders/${existingOrderId}`,
                    {
                        headers: {
                            "x-api-version": "2023-08-01",
                            "x-client-id": process.env.CASHFREE_APP_ID!,
                            "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
                        },
                    }
                ).then((r) => r.json());

                return NextResponse.json({
                    orderId: existingOrderId,
                    paymentSessionId: orderDetails.payment_session_id,
                    amount: selectedPack.amount,
                    credits: selectedPack.credits,
                });
            }
        }

        // getting full user details for cashfree
        const fullUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                cashfreeCustomerId: true,
            },
        });

        if (!fullUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found!!",
                },
                {
                    status: 404,
                }
            );
        }

        // generating new order ID
        const orderId = generateOrderId(user.id);

        // creating an order in CashFree
        const cashfreeOrder = await createCashfreeOrder({
            order_id: orderId,
            order_amount: selectedPack.amount,
            order_currency: "INR",
            customer_details: {
                customer_id: fullUser.cashfreeCustomerId || fullUser.id,
                customer_email: fullUser.email,
                customer_name: fullUser.name,
                customer_phone: "9999999999", // required by Cashfree — update if you collect phone
            },
            order_meta: {
                return_url: `${APP_URL}/pricing?payment=verifying&order_id=${orderId}`,
                notify_url: `${APP_URL}/api/webhooks/cashfree`,
            },
            order_note: `${selectedPack.credits} credits for ManimFlow`,
        });

        // saving pending purchase to DB
        await prisma.creditPurchase.create({
            data: {
                userId: user.id,
                credits: selectedPack.credits,
                amountPaid: selectedPack.amount * 100, // storing price in paisa
                cashfreeOrderId: orderId,
                status: "PENDING",
            },
        });

        // store cashfreeid if first time
        if (!fullUser.cashfreeCustomerId) {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    cashfreeCustomerId: fullUser.id,
                },
            });
        }

        // set idempotency key
        await redis.set(idempotencyKey, orderId, { ex: 60 * 10 }); // 10 TTL

        return NextResponse.json({
            orderId,
            paymentSessionId: cashfreeOrder.payment_session_id,
            amount: selectedPack.amount,
            credits: selectedPack.credits,
        });
    } catch (error) {
        console.log("[CreateOrder] Error: ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server Error, Failed to create order ",
            },
            {
                status: 500,
            }
        );
    }
}
