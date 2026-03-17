"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import ApiNavbar from "@/components/apiDocs/ApiNavbar";
import { Footer } from "@/components/Footer";

type PaymentState = "IDLE" | "LOADING" | "CHECKOUT" | "VERIFYING" | "SUCCESS" | "ERROR";

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

function ApiPricingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, update: updateSession } = useSession();

    const [paymentState, setPaymentState] = useState<PaymentState>("IDLE");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const payment = searchParams.get("payment");
        const orderId = searchParams.get("order_id");

        if (payment === "verifying" && orderId) {
            setPaymentState("VERIFYING");
            pollPaymentStatus(orderId);
        }
    }, [searchParams]);

    const pollPaymentStatus = useCallback(
        async (orderId: string) => {
            let attempts = 0;

            const poll = async () => {
                try {
                    const res = await fetch(`/api/payment/status?orderId=${orderId}`);
                    const data = await res.json();

                    if (data.status === "COMPLETED") {
                        setSuccessMessage(
                            `${data.credits} credits added! New balance: ${data.currentBalance}`
                        );
                        setPaymentState("SUCCESS");
                        await updateSession();
                        router.replace("/api-pricing");
                        return;
                    }

                    if (data.status === "FAILED") {
                        setErrorMessage("Payment failed. Please try again.");
                        setPaymentState("ERROR");
                        router.replace("/api-pricing");
                        return;
                    }

                    attempts++;
                    if (attempts < MAX_POLL_ATTEMPTS) {
                        setTimeout(poll, POLL_INTERVAL_MS);
                    } else {
                        setSuccessMessage(
                            "Payment received! Credits will be added within a few minutes."
                        );
                        setPaymentState("SUCCESS");
                        router.replace("/api-pricing");
                    }
                } catch {
                    attempts++;
                    if (attempts < MAX_POLL_ATTEMPTS) {
                        setTimeout(poll, POLL_INTERVAL_MS);
                    } else {
                        setErrorMessage(
                            "Could not verify payment. Check your credits in a few minutes."
                        );
                        setPaymentState("ERROR");
                    }
                }
            };

            poll();
        },
        [router, updateSession]
    );

    const handleBuyCreditPack = async (packId: "PACK_30" | "PACK_60") => {
        if (!session?.user) {
            router.push("/signin");
            return;
        }

        setPaymentState("LOADING");
        setErrorMessage("");

        try {
            const res = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pack: packId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create order");
            }

            setPaymentState("CHECKOUT");

            const cashfree = await load({
                mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
            });

            cashfree
                .checkout({
                    paymentSessionId: data.paymentSessionId,
                    redirectTarget: "_modal",
                })
                .then((result: any) => {
                    if (result.error) {
                        console.error("[Cashfree] Checkout error:", result.error);
                        setErrorMessage("Payment failed. Please try again.");
                        setPaymentState("ERROR");
                    } else if (result.redirect || result.paymentDetails) {
                        setPaymentState("VERIFYING");
                        pollPaymentStatus(data.orderId);
                    }
                });
        } catch (error: any) {
            console.error("[ApiPricing] Error:", error);
            setErrorMessage(error.message || "Something went wrong");
            setPaymentState("ERROR");
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100 py-24 px-4">
            <ApiNavbar />
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        API Pricing
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                        Simple pay-as-you-go pricing for programmatic video generation. Focus on
                        building, not managing subscriptions.
                    </p>
                </div>

                {paymentState === "SUCCESS" && (
                    <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center">
                        ✓ {successMessage}
                    </div>
                )}
                {paymentState === "ERROR" && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                        {errorMessage}
                        <button
                            onClick={() => setPaymentState("IDLE")}
                            className="ml-3 underline text-sm"
                        >
                            Try again
                        </button>
                    </div>
                )}
                {paymentState === "VERIFYING" && (
                    <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-center flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Verifying payment...
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* FREE */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-zinc-500" />
                            <h2 className="text-xl font-semibold text-white">Free Sandbox</h2>
                        </div>
                        <div className="text-4xl font-bold mb-1">₹0</div>
                        <p className="text-zinc-500 text-sm mb-6">included with acount</p>

                        <ul className="space-y-3 mb-8 flex-1">
                            {[
                                "30 credits / month",
                                "480p preview rendering",
                                "Shared API key limit",
                                "Standard generation speed",
                            ].map((f) => (
                                <li
                                    key={f}
                                    className="flex items-center gap-3 text-sm text-zinc-300"
                                >
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled
                            className="w-full py-2.5 rounded-xl border border-white/10 text-gray-500 text-sm cursor-default"
                        >
                            Included
                        </button>
                    </div>

                    {/* Standard Pack */}
                    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-7 flex flex-col gap-1 relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-orange-400" />
                            <h2 className="text-xl font-semibold text-white">Starter Pack</h2>
                        </div>
                        <div className="text-4xl font-bold mb-1">₹99</div>
                        <p className="text-zinc-500 text-sm mb-6">one-time charge</p>

                        <ul className="space-y-3 mb-8 flex-1">
                            {[
                                "30 API credits",
                                "Access all resolutions",
                                "Never expires",
                                "Top up anytime",
                            ].map((f) => (
                                <li
                                    key={f}
                                    className="flex items-center gap-3 text-sm text-zinc-300"
                                >
                                    <Check className="w-4 h-4 text-orange-400 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleBuyCreditPack("PACK_30")}
                            disabled={["LOADING", "CHECKOUT", "VERIFYING"].includes(paymentState)}
                            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                        >
                            {paymentState === "LOADING" ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                "Buy 30 Credits — ₹99"
                            )}
                        </button>
                    </div>

                    {/* Mega Pack (Removed Pro Monthly) */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-7 flex flex-col gap-1 relative">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                Best Value
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-xl font-semibold text-white">Mega Pack</h2>
                        </div>
                        <div className="text-4xl font-bold mb-1">₹199</div>
                        <p className="text-zinc-500 text-sm mb-6">one-time charge</p>

                        <ul className="space-y-3 mb-8 flex-1">
                            {[
                                "60 API credits",
                                "Access all resolutions",
                                "Never expires",
                                "Top up anytime",
                            ].map((f) => (
                                <li
                                    key={f}
                                    className="flex items-center gap-3 text-sm text-zinc-300"
                                >
                                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleBuyCreditPack("PACK_60")}
                            disabled={["LOADING", "CHECKOUT", "VERIFYING"].includes(paymentState)}
                            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        >
                            {paymentState === "LOADING" ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                "Buy 60 Credits — ₹199"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-20 max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold mb-8 text-center">Common Questions</h3>
                <div className="space-y-4">
                    {[
                        {
                            q: "What counts as 1 credit?",
                            a: "Code generation uses 1 credit. Video rendering uses 2 credits.",
                        },
                        {
                            q: "Do credits expire?",
                            a: "Monthly plan credits reset every 30 days. Credit pack credits never expire.",
                        },
                        {
                            q: "Can I stack credit packs with my plan?",
                            a: "Yes. Credit pack credits add on top of your existing plan balance.",
                        },
                    ].map(({ q, a }) => (
                        <div
                            key={q}
                            className="border border-white/10 rounded-xl p-5 bg-white/[0.02]"
                        >
                            <p className="font-medium text-sm text-white mb-1">{q}</p>
                            <p className="text-gray-400 text-sm">{a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ApiPricingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                    <Loader2 className="animate-spin w-6 h-6 text-zinc-400" />
                </div>
            }
        >
            <ApiPricingContent />
            <Footer />
        </Suspense>
    );
}
