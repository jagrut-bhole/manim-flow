import axios from "axios";
import { useState, useRef } from "react";

interface RenderOptions {
    animationId: string;
    code: string;
    quality?: string;
}

interface RenderState {
    status: "idle" | "rendering" | "busy" | "success" | "error";
    message: string;
    retryAfterSeconds: number; // countdown when busy
    position?: number;
}

export function useRenderVideo() {
    const [state, setState] = useState<RenderState>({
        status: "idle",
        message: "",
        retryAfterSeconds: 0,
    });

    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const retryRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimers = () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (retryRef.current) clearTimeout(retryRef.current);
    };

    const startRender = async (options: RenderOptions) => {
        clearTimers();
        setState({
            status: "rendering",
            message: "Starting render job...",
            retryAfterSeconds: 0,
        });

        try {
            const res = await axios.post("/api/ai/render-video", {
                animationId: options.animationId,
                code: options.code,
                quality: options.quality,
            });

            const data = res.data;

            // ─── Busy (429) ──────────────────────────────────────────────
            if (res.status === 429 || data.busy) {
                const retryAfter = data.retryAfterSeconds ?? 30;
                const position = data.position ?? 1;

                setState({
                    status: "busy",
                    message: "Server is busy",
                    retryAfterSeconds: retryAfter,
                    position,
                });

                // countdown every second
                let remaining = retryAfter;
                countdownRef.current = setInterval(() => {
                    remaining -= 1;
                    setState((prev) => ({ ...prev, retryAfterSeconds: remaining }));
                    if (remaining <= 0) clearInterval(countdownRef.current!);
                }, 1000);

                // auto-retry once countdown expires
                retryRef.current = setTimeout(() => {
                    startRender(options);
                }, retryAfter * 1000);

                return;
            }

            // ─── Insufficient credits (402) ──────────────────────────────
            if (res.status === 402) {
                setState({
                    status: "error",
                    message: data.message || "Insufficient credits",
                    retryAfterSeconds: 0,
                });
                return;
            }

            // ─── Success (202) ───────────────────────────────────────────
            if (res.status === 202 && data.success) {
                setState({
                    status: "success",
                    message: "Rendering started!",
                    retryAfterSeconds: 0,
                });
                return;
            }

            // ─── Other errors ─────────────────────────────────────────────
            setState({
                status: "error",
                message: data.message || "Something went wrong",
                retryAfterSeconds: 0,
            });
        } catch (error: any) {
            // axios throws on 4xx/5xx, check response
            const data = error?.response?.data;
            const status = error?.response?.status;

            if (status === 429 || data?.busy) {
                const retryAfter = data?.retryAfterSeconds ?? 30;
                const position = data?.position ?? 1;

                setState({
                    status: "busy",
                    message: "Server is busy",
                    retryAfterSeconds: retryAfter,
                    position,
                });

                let remaining = retryAfter;
                countdownRef.current = setInterval(() => {
                    remaining -= 1;
                    setState((prev) => ({ ...prev, retryAfterSeconds: remaining }));
                    if (remaining <= 0) clearInterval(countdownRef.current!);
                }, 1000);

                retryRef.current = setTimeout(() => {
                    startRender(options);
                }, retryAfter * 1000);

                return;
            }

            if (status === 402) {
                setState({
                    status: "error",
                    message: data?.message || "Insufficient credits",
                    retryAfterSeconds: 0,
                });
                return;
            }

            setState({
                status: "error",
                message: data?.message || "Network error. Please try again.",
                retryAfterSeconds: 0,
            });
        }
    };

    const reset = () => {
        clearTimers();
        setState({ status: "idle", message: "", retryAfterSeconds: 0 });
    };

    return { state, startRender, reset };
}
