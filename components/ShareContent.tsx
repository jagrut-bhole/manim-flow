"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  VideoPlayer,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeRange,
  VideoPlayerContent,
} from "@/components/ui/VideoPlayer";
import type { AnimationModel } from "@/app/generated/prisma/models/Animation";
import AnimatedShapes from "./AnimatedShapes";

interface ShareContentProps {
  animation: AnimationModel & {
    user: {
      name: string | null;
      id: string;
    };
  };
}

export function ShareContent({ animation }: ShareContentProps) {
  return (
    <div className="min-h-screen bg-[#030303] relative">
      <AnimatedShapes />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="aspect-video">
            <VideoPlayer style={{ width: "100%", height: "110%" }}>
              <VideoPlayerContent src={animation.videoUrl || ""} slot="media" />
              <VideoPlayerControlBar className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-5 py-3 bg-transparent">
                <VideoPlayerPlayButton />
                <VideoPlayerTimeRange />
              </VideoPlayerControlBar>
            </VideoPlayer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121212] rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Prompt :
            <p className="text-white leading-relaxed mb-4">
              {animation.prompt}
            </p>
          </h2>

          <p className="text-sm text-gray-100">
            Created by {animation.user.name || "Anonymous"}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-gray-100 mb-4">
            Want to create your own animations?
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="text-black cursor-pointer bg-white font-semibold rounded-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300 px-6 py-3"
          >
            Try Manim Flow
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
