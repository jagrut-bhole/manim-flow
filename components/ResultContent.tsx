"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  ArrowLeft,
  Bot,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  VideoPlayer,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
  VideoPlayerContent,
} from "@/components/ui/VideoPlayer";
import type { AnimationModel } from "@/app/generated/prisma/models/Animation";

import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface ResultContentProps {
  animation: AnimationModel;
}

export function ResultContent({ animation }: ResultContentProps) {
  const router = useRouter();

  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(true);
  const [showContent, setShowContent] = useState<boolean>(false);

  const truncatePrompt = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + ".....";
  };

  useEffect(() => {
    const duration = 500;
    const end = Date.now() + duration;
    const colors = ["#a855f7", "#3b82f6", "#22c55e", "#eab308", "#ec4899"];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: colors,
    })

    frame();

    // Hide success message after 1.8 seconds
    setTimeout(() => setShowSuccessMessage(false), 1800);

    // Show video content after success message starts fading
    setTimeout(() => setShowContent(true), 1800);
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            onClick={() => router.replace('/dashboard')}
            className="flex text-white items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Successfully Rendered!!</h1>
            </motion.div>
          )}
        </AnimatePresence>

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Video Preview */}
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="aspect-video">
                <VideoPlayer style={{ width: "100%", height: "100%" }}>
                  <VideoPlayerContent
                    src={animation.videoUrl || ""}
                    autoPlay
                    loop
                    muted
                    slot="media"
                    className="w-full h-full object-cover"
                  />
                  <VideoPlayerControlBar className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-5 py-3 bg-transparent">
                    <VideoPlayerPlayButton />
                    <VideoPlayerTimeRange className="flex-1 mx-4" />
                  </VideoPlayerControlBar>
                </VideoPlayer>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prompt Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-semibold">Prompt : {truncatePrompt(animation.prompt).toUpperCase()}</h3>
                </div>
              </motion.div>

              {/* AI Agent Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-6">
                {animation.videoUrl && (
                  <a
                    href={animation.videoUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium gap-2 hover:cursor-pointer">
                      <Download className="w-4 h-4 " />
                      Download Video
                    </Button>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Download Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4 pt-4"
            >

            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
