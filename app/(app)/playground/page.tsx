"use client";

import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Play } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const DEFAULT_CODE = `
from manim import *

class MyAnimation(Scene):
    def construct(self):
        # Create a circle
        circle = Circle(radius=2, color=BLUE)
        
        # Create a square
        square = Square(side_length=3, color=GREEN)
        
        # Animate
        self.play(Create(circle))
        self.play(Transform(circle, square))
        self.play(FadeOut(circle))
`;

export default function PlaygroundPage() {
  const [code, setCode] = useState(DEFAULT_CODE);

  const handleRender = () => {
    toast.info("Coming soon! 🚀", {
      description: "The playground render feature is under development.",
      classNames: {
        description: "text-black",
      },
    });
    setTimeout(() => {
      toast.dismiss();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Playground
            </h1>
            <p className="text-neutral-400">
              Write and test your Manim code here
            </p>
          </div>

          {/* Editor Section */}
          <div className="bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/50 border-b border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-500 px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 uppercase tracking-widest">
                    python
                  </span>
                  <span className="text-xs font-mono text-neutral-300">
                    playground.py
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
            </div>

            {/* Editor */}
            <div className="h-[60vh]">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily:
                    "JetBrains Mono, Menlo, Monaco, Consolas, Courier New, monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
          </div>

          {/* Render Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleRender}
              className="px-8 py-6 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              Render Animation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
