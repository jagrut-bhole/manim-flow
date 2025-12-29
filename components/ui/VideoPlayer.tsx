"use client";

import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Play, Plus } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeRange,
} from "media-chrome/react";
import type { ComponentProps } from "react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

export type VideoPlayerProps = ComponentProps<typeof MediaController>;

export const VideoPlayer = ({ style, ...props }: VideoPlayerProps) => (
  <MediaController
    style={{
      ...style,
    }}
    {...props}
  />
);

export type VideoPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;

export const VideoPlayerControlBar = (props: VideoPlayerControlBarProps) => (
  <MediaControlBar {...props} />
);

export type VideoPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;

export const VideoPlayerTimeRange = ({
  className,
  ...props
}: VideoPlayerTimeRangeProps) => (
  <MediaTimeRange
    className={cn(
      "[--media-range-thumb-opacity:0] [--media-range-track-height:2px] [--media-range-bar-color:white] [--media-range-track-background:rgba(255,255,255,0.3)] border-none bg-transparent",
      className,
    )}
    {...props}
  />
);

export type VideoPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;

export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton
    className={cn(
      "[--media-icon-color:white] [--media-button-icon-width:24px] [--media-button-icon-height:24px] border-none bg-transparent",
      className,
    )}
    {...props}
  />
);

export type VideoPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;

export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton
    className={cn(
      "[--media-icon-color:white] [--media-button-icon-width:24px] [--media-button-icon-height:24px]",
      className,
    )}
    {...props}
  />
);

export type VideoPlayerContentProps = ComponentProps<"video">;

export const VideoPlayerContent = ({
  className,
  ...props
}: VideoPlayerContentProps) => (
  <video className={cn("mb-0 mt-0", className)} {...props} />
);

interface VideoThumbnailProps {
  src: string;
  poster?: string;
  onPlay?: () => void;
}

export const VideoThumbnail = ({
  src,
  poster,
  onPlay,
}: VideoThumbnailProps) => {
  const [showVideoPopOver, setShowVideoPopOver] = useState(false);

  const SPRING = {
    mass: 0.1,
  };

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0, SPRING);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    opacity.set(1);
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left);
    y.set(e.clientY - bounds.top);
  };

  const handleClick = () => {
    setShowVideoPopOver(true);
    onPlay?.();
  };

  return (
    <>
      <AnimatePresence>
        {showVideoPopOver && (
          <VideoPopOver src={src} setShowVideoPopOver={setShowVideoPopOver} />
        )}
      </AnimatePresence>
      <div
        onMouseMove={handlePointerMove}
        onMouseLeave={() => {
          opacity.set(0);
        }}
        onClick={handleClick}
        className="relative h-full w-full cursor-pointer overflow-hidden"
      >
        <motion.div
          style={{ x, y, opacity }}
          className="pointer-events-none absolute z-20 flex w-fit -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center gap-2 rounded-full bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg"
        >
          <Play className="size-4 fill-current" /> Play
        </motion.div>
        <video
          autoPlay
          muted
          playsInline
          loop
          poster={poster}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
          <source src={src} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </>
  );
};

const VideoPopOver = ({
  src,
  setShowVideoPopOver,
}: {
  src: string;
  setShowVideoPopOver: (showVideoPopOver: boolean) => void;
}) => {
  return (
    <div className="fixed left-0 top-0 z-101 flex h-screen w-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-0 h-full w-full bg-background/95 backdrop-blur-xl"
        onClick={() => setShowVideoPopOver(false)}
      />
      <motion.div
        initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5%)", opacity: 0 }}
        animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
        exit={{
          clipPath: "inset(43.5% 43.5% 33.5% 43.5%)",
          opacity: 0,
          transition: {
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.2, delay: 0.8 },
          },
        }}
        transition={{
          duration: 1,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-border/50 shadow-2xl"
      >
        <VideoPlayer style={{ width: "100%", height: "100%" }}>
          <VideoPlayerContent
            src={src}
            autoPlay
            slot="media"
            className="w-full object-cover"
            style={{ width: "100%", height: "100%" }}
          />

          <button
            onClick={() => setShowVideoPopOver(false)}
            className="absolute right-3 top-3 z-10 rounded-full bg-background/50 p-2 backdrop-blur-sm transition-colors hover:bg-background/80"
          >
            <Plus className="size-5 rotate-45 text-foreground" />
          </button>
          <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 items-center justify-center bg px-5 py-4">
            <VideoPlayerPlayButton className="h-5 bg-transparent text-foreground" />
            <VideoPlayerTimeRange className="flex-1 bg-transparent" />
            <VideoPlayerMuteButton className="size-5 bg-transparent text-foreground" />
          </VideoPlayerControlBar>
        </VideoPlayer>
      </motion.div>
    </div>
  );
};

export default VideoThumbnail;
