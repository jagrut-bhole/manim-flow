"use client";

import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { PromptInput } from "@/components/PromptInput";
import { useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const user: User = session?.user;

  const [inputText, setInputText] = useState("");

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black">
        <div className="text-center mb-8 max-w-2xl animate-fade-in">
          <p className="text-white"></p>
          <h1 className="text-6xl font-semibold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-neutral-500">
            Where ideas become reality
          </h1>
          <p className="text-neutral-500 text-lg font-medium mb-5">
            {/* Build fully functional apps and websites through simple conversations */}
            {user?.name}
          </p>
        </div>

        <div className="w-full max-w-4xl space-y-4">
          <PromptInput value={inputText} onChange={setInputText} />
        </div>

        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>
      </div>
    </div>
  );
}
