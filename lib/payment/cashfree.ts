import crypto from "crypto";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "TEST";

export const CASHFREE_BASE_URL =
    CASHFREE_ENV === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

export const CREDIT_PACKS = {
    PACK_30: {
        credits: 30,
        // amount: 99,
        amount: 1,
        name: "30 Credits Pack",
    },
    PACK_60: {
        credits: 60,
        amount: 199,
        name: "60 Credits Pack",
    },
} as const;

export type CreditPackKey = keyof typeof CREDIT_PACKS;

export interface CashfreeOrderPayload {
    order_id: string;
    order_amount: number;
    order_currency: string;
    customer_details: {
        customer_id: string;
        customer_email: string;
        customer_name: string;
        customer_phone: string;
    };
    order_meta: {
        return_url: string;
        notify_url: string;
    };
    order_note?: string;
}

export interface CashfreeOrderResponse {
    cf_order_id: string;
    order_id: string;
    entity: string;
    order_currency: string;
    order_amount: number;
    order_status: string;
    payment_session_id: string; // used to open Cashfree checkout
    created_at: string;
}

export async function cashFreeRequest<T>(
    endpoint: string,
    method: "GET" | "POST",
    body?: object
): Promise<T> {
    const response = await fetch(`${CASHFREE_BASE_URL}/${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "x-client-id": CASHFREE_APP_ID,
            "x-client-secret": CASHFREE_SECRET_KEY,
            "x-api-version": "2023-08-01",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("[Cashfree] API error:", error);
        throw new Error(error.message || "Cashfree API request failed");
    }

    return response.json() as Promise<T>;
}

export async function createCashfreeOrder(
    payload: CashfreeOrderPayload
): Promise<CashfreeOrderResponse> {
    return cashFreeRequest<CashfreeOrderResponse>("/orders", "POST", payload);
}

export function verifyCashfreeWebhook(
    rawBody: string,
    signature: string,
    timestamp: string
): boolean {
    const signedPayload = timestamp + rawBody;
    const expectedSignature = crypto
        .createHmac("sha256", CASHFREE_SECRET_KEY)
        .update(signedPayload)
        .digest("base64");

    return expectedSignature === signature;
}

export function generateOrderId(userId: string): string {
    const shortId = userId.slice(0, 8);
    const timestamp = Date.now();
    return `cf_${shortId}_${timestamp}`;
}
