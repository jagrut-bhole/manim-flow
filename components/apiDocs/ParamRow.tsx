"use client";

export default function ParamRow({
    name,
    type,
    required,
    description,
}: {
    name: string;
    type: string;
    required?: boolean;
    description: string;
}) {
    return (
        <tr className="border-b border-zinc-800/50 last:border-0">
            <td className="py-2.5 pr-4 align-top">
                <span className="font-mono text-xs text-zinc-300">{name}</span>
                {required ? (
                    <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        required
                    </span>
                ) : (
                    <span className="ml-2 text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                        optional
                    </span>
                )}
            </td>
            <td className="py-2.5 pr-4 align-top">
                <span className="font-mono text-xs text-purple-400">{type}</span>
            </td>
            <td className="py-2.5 align-top text-xs text-zinc-400">{description}</td>
        </tr>
    );
}
