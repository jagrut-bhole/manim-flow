"use client";

export default function MethodBadge({ method }: { method: "GET" | "POST" | "DELETE" }) {
    const colors = {
        GET: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        POST: "bg-green-500/10 text-green-400 border-green-500/20",
        DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
        <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${colors[method]}`}
        >
            {method}
        </span>
    );
}
