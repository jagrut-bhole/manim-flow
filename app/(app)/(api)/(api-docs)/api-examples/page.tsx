"use client";

import { GalleryCard } from "@/components/GalleryCard";
import CodeBlock from "@/components/apiDocs/CodeBlock";
import { Terminal } from "lucide-react";
import ApiNavbar from "@/components/apiDocs/ApiNavbar";

export default function ApiExamples() {
    const example1Code = `curl -X POST https://manimflow.com/api/v1/generate \\
  -H "x-api-key: sk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "explain bubble sort step by step",
    "quality": "high"
  }'`;

    const example2Code = `curl -X POST https://manimflow.com/api/v1/generate \\
  -H "x-api-key: sk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "visualize the Pythagorean theorem using a right triangle with labeled sides a, b, c",
    "quality": "high"
  }'`;

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100 pb-20">
            <ApiNavbar />
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Terminal className="w-5 h-5 text-zinc-500" />
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                            Examples
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                        API Gallery
                    </h1>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
                        See what you can build with the ManimFlow API. Here are a few examples
                        showcasing the power of programmatic video generation.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Example 1 */}
                    <div className="space-y-6 flex flex-col items-center text-center">
                        <div className="w-full">
                            <h2 className="text-lg font-semibold text-white mb-2">
                                1. Bubble Sort Visualization
                            </h2>
                            <p className="text-sm text-zinc-400 mb-4 max-w-2xl mx-auto">
                                A step-by-step generic animation explaining the bubble sort
                                algorithm.
                            </p>
                            <CodeBlock code={example1Code} />
                        </div>
                        <div className="max-w-2xl w-full mx-auto">
                            <GalleryCard
                                id={1}
                                title="Bubble Sort Algorithm"
                                prompt="explain bubble sort step by step"
                                author="ManimFlow API"
                                videoSrc="https://manimflow-videos.s3.ap-south-1.amazonaws.com/videos/bubble-sort.mp4"
                                isNew={true}
                                code={example1Code}
                            />
                        </div>
                    </div>

                    {/* Example 2 */}
                    <div className="space-y-6 flex flex-col items-center text-center">
                        <div className="w-full">
                            <h2 className="text-lg font-semibold text-white mb-2">
                                2. Pythagorean Theorem
                            </h2>
                            <p className="text-sm text-zinc-400 mb-4 max-w-2xl mx-auto">
                                Visualize mathematical concepts beautifully using the API.
                            </p>
                            <CodeBlock code={example2Code} />
                        </div>
                        <div className="max-w-2xl w-full mx-auto">
                            <GalleryCard
                                id={2}
                                title="Pythagorean Theorem"
                                prompt="visualize the Pythagorean theorem using a right triangle with labeled sides a, b, c"
                                author="ManimFlow API"
                                videoSrc="https://manimflow-videos.s3.ap-south-1.amazonaws.com/videos/pythagoras.mp4"
                                code={example2Code}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
