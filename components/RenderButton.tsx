"use client";

import { Loader2, Clock, AlertCircle } from "lucide-react";
import { useRenderVideo } from "@/hooks/useRenderVideo";
import { useRouter } from "next/navigation";

interface RenderButtonProps {
    animationId: string;
    code: string;
    quality?: string;
    onRenderStarted?: () => void;
}

export function RenderButton({ animationId, code, quality, onRenderStarted }: RenderButtonProps) {
    const { state, startRender, reset } = useRenderVideo();
    const router = useRouter();

    const handleClick = async () => {
        await startRender({ animationId, code, quality });
        // After startRender resolves, check updated state via the ref approach below
    };

    // Use effect-free check — if success, navigate
    if (state.status === "success") {
        router.push(`/result/${animationId}`);
        return null;
    }

    // ─── Busy state ───────────────────────────────────────────────────────────
    if (state.status === "busy") {
        return (
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                    <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>
                        Server busy — #{state.position} in queue.{" "}
                        <span className="font-mono font-medium">
                            Retrying in {state.retryAfterSeconds}s...
                        </span>
                    </span>
                </div>
                <button
                    onClick={reset}
                    className="text-xs text-neutral-500 hover:text-neutral-300 underline underline-offset-2 transition-colors"
                >
                    Cancel
                </button>
            </div>
        );
    }

    // ─── Error state ──────────────────────────────────────────────────────────
    if (state.status === "error") {
        return (
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{state.message}</span>
                </div>
                <button
                    onClick={reset}
                    className="px-5 py-2 rounded-full border border-neutral-700 text-neutral-300 text-sm hover:bg-neutral-800 hover:text-white transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ─── Rendering state ──────────────────────────────────────────────────────
    if (state.status === "rendering") {
        return (
            <button
                disabled
                className="flex items-center gap-2 bg-blue-600/50 text-white px-6 py-2.5 rounded-full font-medium text-sm cursor-not-allowed shadow-lg shadow-blue-600/10"
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                {state.message}
            </button>
        );
    }

    // ─── Idle state ───────────────────────────────────────────────────────────
    return (
        <button
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm cursor-pointer"
        >
            Render Video
        </button>
    );
}
