"use client";

export default function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4 pb-2 border-b border-zinc-800">
            {children}
        </h2>
    );
}
