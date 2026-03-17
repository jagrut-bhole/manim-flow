"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import MethodBadge from "./MethodBadge";

export default function EndpointCard({
    method,
    path,
    description,
    children,
}: {
    method: "GET" | "POST" | "DELETE";
    path: string;
    description: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden mb-3">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-900/50 transition-colors text-left"
            >
                <MethodBadge method={method} />
                <span className="font-mono text-sm text-zinc-200">{path}</span>
                <span className="text-xs text-zinc-500 ml-auto mr-2 hidden sm:block">
                    {description}
                </span>
                <ChevronRight
                    className={`w-4 h-4 text-zinc-600 transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
                />
            </button>
            {open && <div className="border-t border-zinc-800 p-5 space-y-5">{children}</div>}
        </div>
    );
}
