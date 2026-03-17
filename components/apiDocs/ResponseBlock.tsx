"use client";

import CodeBlock from "./CodeBlock";

export default function ResponseBlock({
    status,
    label,
    json,
}: {
    status: number;
    label: string;
    json: string;
}) {
    const color =
        status < 300 ? "text-green-400" : status < 500 ? "text-amber-400" : "text-red-400";
    const special: Record<number, string> = { 202: "text-blue-400" };
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className={`font-mono text-sm font-semibold ${special[status] ?? color}`}>
                    {status}
                </span>
                <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <CodeBlock code={json} />
        </div>
    );
}
