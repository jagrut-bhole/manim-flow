"use client";

import { useState } from "react";
import { generateSnippets, pollSnippets, fullExampleSnippets } from "@/constants/apiDocsConstants";
import LangTabs from "@/components/apiDocs/LangTabs";
import CodeBlock from "@/components/apiDocs/CodeBlock";
import EndpointCard from "@/components/apiDocs/EndpointCard";
import ParamRow from "@/components/apiDocs/ParamRow";
import ResponseBlock from "@/components/apiDocs/ResponseBlock";
import SectionTitle from "@/components/apiDocs/SectionTitle";
import type { Lang } from "@/constants/apiDocsConstants";
import { Terminal, Shield, Zap, Clock } from "lucide-react";
import ApiNavbar from "@/components/apiDocs/ApiNavbar";

export default function ApiDocsPage() {
    const year = new Date().getFullYear();

    const [genLang, setGenLang] = useState<Lang>("curl");
    const [pollLang, setPollLang] = useState<Lang>("curl");
    const [fullLang, setFullLang] = useState<"js" | "python">("js");
    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100">
            <ApiNavbar />
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Terminal className="w-5 h-5 text-zinc-500" />
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                            API Reference
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                        ManimFlow API
                    </h1>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
                        Generate mathematical animation videos programmatically. Send a prompt, get
                        back a video URL. Built for developers building EdTech apps, algorithm
                        visualizers, and study tools.
                    </p>
                    <div className="mt-5 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Base URL</span>
                        <code className="text-xs font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300">
                            https://manimflow.com/api/v1
                        </code>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
                    {[
                        { icon: Shield, label: "Auth", value: "API Key" },
                        { icon: Zap, label: "Format", value: "JSON" },
                        { icon: Clock, label: "Pattern", value: "Async polling" },
                    ].map(({ icon: Icon, label, value }) => (
                        <div
                            key={label}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3"
                        >
                            <Icon className="w-4 h-4 text-zinc-600 shrink-0" />
                            <div>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
                                    {label}
                                </p>
                                <p className="text-sm text-zinc-300 font-medium">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Authentication */}
                <div className="mb-10">
                    <SectionTitle>Authentication</SectionTitle>
                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 text-sm text-blue-300 mb-4">
                        All requests must include your API key in the{" "}
                        <code className="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-200">
                            x-api-key
                        </code>{" "}
                        header. Never put your key in the URL — it will be logged and exposed.
                    </div>
                    <div className="mb-2 text-xs text-zinc-500 font-mono">Header format</div>
                    <CodeBlock code="x-api-key: sk_5UPneJm7A393uRqpQgxLYuNAmVLdg5cAE5yCkNc4" />
                    <div className="mt-5">
                        <p className="text-sm font-medium text-zinc-300 mb-3">Getting an API key</p>
                        <ol className="space-y-1.5 text-sm text-zinc-400">
                            {[
                                "Sign in to your ManimFlow account",
                                "Go to Settings → API Keys",
                                'Click "Create new key" and give it a name',
                                "Copy the key immediately — it is shown only once",
                            ].map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="text-zinc-600 font-mono shrink-0">
                                        {i + 1}.
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Credits */}
                <div className="mb-10">
                    <SectionTitle>Credits</SectionTitle>
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-sm border-collapse min-w-[400px]">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    {["action", "quality", "credits used"].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left py-2.5 pr-4 text-xs text-zinc-500 font-medium"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    {
                                        action: "Code generation",
                                        quality: "—",
                                        credits: 1,
                                        bold: false,
                                    },
                                    {
                                        action: "Video render",
                                        quality: "low (480p)",
                                        credits: 2,
                                        bold: false,
                                    },
                                    {
                                        action: "Video render",
                                        quality: "medium (720p)",
                                        credits: 3,
                                        bold: false,
                                    },
                                    {
                                        action: "Video render",
                                        quality: "high (1080p)",
                                        credits: 4,
                                        bold: false,
                                    },
                                    {
                                        action: "Total per request",
                                        quality: "low",
                                        credits: 3,
                                        bold: true,
                                    },
                                    { action: "", quality: "medium", credits: 4, bold: true },
                                    { action: "", quality: "high", credits: 5, bold: true },
                                ].map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-zinc-800/40 last:border-0"
                                    >
                                        <td
                                            className={`py-2.5 pr-4 text-xs ${row.bold ? "font-semibold text-zinc-200" : "text-zinc-400"}`}
                                        >
                                            {row.action}
                                        </td>
                                        <td className="py-2.5 pr-4 text-xs text-zinc-400 font-mono">
                                            {row.quality}
                                        </td>
                                        <td
                                            className={`py-2.5 text-xs font-mono ${row.bold ? "font-bold text-zinc-200" : "text-zinc-400"}`}
                                        >
                                            {row.credits}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3">
                        Credits are shared across the website and API. Top up anytime at{" "}
                        <a href="/pricing" className="text-zinc-400 underline underline-offset-2">
                            manimflow.com/pricing
                        </a>
                        .
                    </p>
                </div>

                {/* Endpoints */}
                <div className="mb-10">
                    <SectionTitle>Endpoints</SectionTitle>

                    <EndpointCard
                        method="POST"
                        path="/generate"
                        description="Generate animation from prompt"
                    >
                        <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3 text-xs text-blue-300">
                            Returns a <code className="font-mono">jobId</code> immediately. The
                            video renders in the background — poll{" "}
                            <code className="font-mono">/jobs/:jobId</code> for the result.
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-400 mb-3">
                                Request headers
                            </p>
                            <div className="overflow-x-auto pb-4">
                                <table className="w-full min-w-[500px]">
                                    <tbody>
                                        <ParamRow
                                            name="x-api-key"
                                            type="string"
                                            required
                                            description="Your API key"
                                        />
                                        <ParamRow
                                            name="Content-Type"
                                            type="string"
                                            required
                                            description="Must be application/json"
                                        />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-400 mb-3">Request body</p>
                            <div className="overflow-x-auto pb-4">
                                <table className="w-full min-w-[600px]">
                                    <tbody>
                                        <ParamRow
                                            name="prompt"
                                            type="string"
                                            required
                                            description='What to animate. Max 1000 chars. Be specific — "explain bubble sort step by step" works better than "sorting".'
                                        />
                                        <ParamRow
                                            name="quality"
                                            type='"low" | "medium" | "high"'
                                            description='Video quality. "low" = 480p, "medium" = 720p, "high" = 1080p. Defaults to "low".'
                                        />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-400 mb-3">
                                Example request
                            </p>
                            <LangTabs
                                langs={["curl", "js", "python"]}
                                active={genLang}
                                onChange={(l) => setGenLang(l as Lang)}
                            />
                            <CodeBlock code={generateSnippets[genLang]} />
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs font-medium text-zinc-400">Response</p>
                            <ResponseBlock
                                status={202}
                                label="Accepted"
                                json={`{
  "jobId": "cmmrohh160000wk7j15g2mp05",
  "status": "queued",
  "message": "Animation is being generated. Poll /api/v1/jobs/:jobId for status.",
  "creditsUsed": 3,
  "quality": "low"
}`}
                            />
                        </div>
                    </EndpointCard>

                    <EndpointCard
                        method="GET"
                        path="/jobs/:jobId"
                        description="Poll for video status"
                    >
                        <div>
                            <p className="text-xs font-medium text-zinc-400 mb-3">
                                Path parameters
                            </p>
                            <div className="overflow-x-auto pb-4">
                                <table className="w-full min-w-[500px]">
                                    <tbody>
                                        <ParamRow
                                            name="jobId"
                                            type="string"
                                            required
                                            description="The jobId returned from POST /generate"
                                        />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-400 mb-3">
                                Example request
                            </p>
                            <LangTabs
                                langs={["curl", "js", "python"]}
                                active={pollLang}
                                onChange={(l) => setPollLang(l as Lang)}
                            />
                            <CodeBlock code={pollSnippets[pollLang]} />
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs font-medium text-zinc-400">Responses</p>
                            <ResponseBlock
                                status={200}
                                label="processing"
                                json={`{
  "jobId": "cmmrohh160000wk7j15g2mp05",
  "status": "processing",
  "prompt": "explain bubble sort...",
  "message": "Still processing. Poll again in a few seconds.",
  "createdAt": "2026-03-15T12:00:00.000Z"
}`}
                            />
                            <ResponseBlock
                                status={200}
                                label="completed"
                                json={`{
  "jobId": "cmmrohh160000wk7j15g2mp05",
  "status": "completed",
  "prompt": "explain bubble sort...",
  "videoUrl": "https://manimflow-videos.s3.ap-south-1.amazonaws.com/videos/...",
  "thumbnailUrl": "https://manimflow-videos.s3.ap-south-1.amazonaws.com/thumbnails/...",
  "duration": 42.5,
  "createdAt": "2026-03-15T12:00:00.000Z"
}`}
                            />
                            <ResponseBlock
                                status={200}
                                label="failed"
                                json={`{
  "jobId": "cmmrohh160000wk7j15g2mp05",
  "status": "failed",
  "error": "Code validation failed: MathTex requires LaTeX..."
}`}
                            />
                        </div>
                    </EndpointCard>
                </div>

                {/* Full example */}
                <div className="mb-10">
                    <SectionTitle>Complete example</SectionTitle>
                    <LangTabs
                        langs={["js", "python"]}
                        active={fullLang}
                        onChange={(l) => setFullLang(l as "js" | "python")}
                    />
                    <CodeBlock code={fullExampleSnippets[fullLang]} />
                    <div className="text-center">
                        <p className="text-xs text-zinc-500 mt-3">
                            Examples are for reference only. You can find the complete API documentation at{" "}
                            <a href="/api-examples" className="text-zinc-400 underline underline-offset-2">
                                manimflow.com/api-examples
                            </a>
                            .
                        </p>
                    </div>
                </div>

                {/* Error reference */}
                <div className="mb-10">
                    <SectionTitle>Error reference</SectionTitle>
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-xs text-amber-300 mb-5">
                        When you receive a 429, check the{" "}
                        <code className="font-mono">Retry-After</code> response header for how many
                        seconds to wait before retrying. Do not poll faster than every 3 seconds on
                        job status.
                    </div>
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-sm border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    {["http", "error code", "meaning"].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left py-2.5 pr-4 text-xs text-zinc-500 font-medium"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    {
                                        s: 401,
                                        code: "missing_api_key",
                                        meaning: "No x-api-key header provided",
                                    },
                                    {
                                        s: 401,
                                        code: "invalid_api_key",
                                        meaning: "Key does not exist or hash mismatch",
                                    },
                                    {
                                        s: 400,
                                        code: "missing_prompt",
                                        meaning: "prompt field is empty or missing",
                                    },
                                    {
                                        s: 400,
                                        code: "prompt_too_long",
                                        meaning: "prompt exceeds 1000 characters",
                                    },
                                    {
                                        s: 400,
                                        code: "invalid_body",
                                        meaning: "Request body is not valid JSON",
                                    },
                                    {
                                        s: 402,
                                        code: "insufficient_credits",
                                        meaning:
                                            "Not enough credits. Response includes creditsRequired and creditsAvailable",
                                    },
                                    {
                                        s: 403,
                                        code: "forbidden",
                                        meaning: "Key disabled or job belongs to different owner",
                                    },
                                    { s: 404, code: "not_found", meaning: "jobId does not exist" },
                                    {
                                        s: 429,
                                        code: "server_busy",
                                        meaning: "Server at capacity. Check Retry-After header",
                                    },
                                    {
                                        s: 500,
                                        code: "codegen_failed",
                                        meaning:
                                            "Gemini failed to generate code. Retry the request",
                                    },
                                    {
                                        s: 500,
                                        code: "internal_error",
                                        meaning: "Unexpected server error",
                                    },
                                ].map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-zinc-800/40 last:border-0"
                                    >
                                        <td className="py-2.5 pr-4">
                                            <span
                                                className={`font-mono text-xs font-semibold ${row.s < 300 ? "text-green-400" : row.s < 500 ? "text-amber-400" : "text-red-400"}`}
                                            >
                                                {row.s}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-4 font-mono text-xs text-zinc-300">
                                            {row.code}
                                        </td>
                                        <td className="py-2.5 text-xs text-zinc-400">
                                            {row.meaning}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Prompt tips */}
                <div className="mb-10">
                    <SectionTitle>Prompt tips</SectionTitle>
                    <div className="space-y-2">
                        {[
                            {
                                good: "explain bubble sort with colored bars showing each swap step by step",
                                bad: "sorting",
                            },
                            {
                                good: "visualize the Pythagorean theorem using a right triangle with labeled sides a, b, c",
                                bad: "math theorem",
                            },
                            {
                                good: "show binary search on a sorted array of 8 elements with a pointer moving left and right",
                                bad: "binary search",
                            },
                        ].map(({ good, bad }, i) => (
                            <div
                                key={i}
                                className="border border-zinc-800 rounded-xl overflow-hidden"
                            >
                                <div className="flex items-start gap-3 px-4 py-3 border-b border-zinc-800/60">
                                    <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded shrink-0 mt-0.5">
                                        good
                                    </span>
                                    <span className="text-xs text-zinc-300 font-mono leading-relaxed">
                                        "{good}"
                                    </span>
                                </div>
                                <div className="flex items-start gap-3 px-4 py-3">
                                    <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded shrink-0 mt-0.5">
                                        bad
                                    </span>
                                    <span className="text-xs text-zinc-400 font-mono leading-relaxed">
                                        "{bad}"
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-800 pt-8 text-center">
                    <p className="text-xs text-zinc-600">
                        ManimFlow API · Questions?{" "}
                        <a
                            href="mailto:support@manimflow.com"
                            className="text-zinc-500 underline underline-offset-2 hover:text-zinc-400"
                        >
                            jagrutbhole10@gmail.com
                        </a>
                    </p>

                    <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-400 mt-5">
                        <a href="/pricing" className="hover:text-white transition-colors">
                            Pricing
                        </a>
                        <a
                            href="/terms-and-conditions"
                            className="hover:text-white transition-colors"
                        >
                            Terms & Conditions
                        </a>
                        <a href="/privacy-policy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                        <a href="/refund-policy" className="hover:text-white transition-colors">
                            Refund Policy
                        </a>
                    </div>
                    {/* Divider Line */}
                    <div className="max-w-4xl mx-auto h-px bg-white/10 mb-8"></div>

                    {/* Copyright Info */}
                    <div className="text-center">
                        <p className="text-slate-500 text-sm font-medium tracking-wide">
                            Manimflow &copy; {year} &mdash; All rights reserved
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
