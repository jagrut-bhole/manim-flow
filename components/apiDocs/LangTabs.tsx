"use client";

export default function LangTabs({
    langs,
    active,
    onChange,
}: {
    langs: string[];
    active: string;
    onChange: (l: string) => void;
}) {
    return (
        <div className="flex gap-1 mb-3">
            {langs.map((l) => (
                <button
                    key={l}
                    onClick={() => onChange(l)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors font-mono ${
                        active === l
                            ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                            : "border-zinc-800 bg-transparent text-zinc-500 hover:text-zinc-400"
                    }`}
                >
                    {l}
                </button>
            ))}
        </div>
    );
}
