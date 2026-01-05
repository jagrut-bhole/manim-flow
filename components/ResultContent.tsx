"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Share2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadButton from "@/components/ui/button-download";
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
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface ResultContentProps {
  animation: AnimationModel;
}

type AnimationStatus = "GENERATING" | "RENDERING" | "COMPLETED" | "FAILED";

interface AnimationData {
  id: string;
  status: AnimationStatus;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  errorMessage: string | null;
}

export function ResultContent({ animation }: ResultContentProps) {
  const router = useRouter();

  const [currentAnimation, setCurrentAnimation] = useState<AnimationData>({
    id: animation.id,
    status: animation.status as AnimationStatus,
    videoUrl: animation.videoUrl,
    thumbnailUrl: animation.thumbnailUrl,
    duration: animation.duration,
    errorMessage: animation.errorMessage,
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "downloaded" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [pollingCount, setPollingCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState(60);

  const isRendering =
    currentAnimation.status === "RENDERING" ||
    currentAnimation.status === "GENERATING";
  const isCompleted = currentAnimation.status === "COMPLETED";
  const isFailed = currentAnimation.status === "FAILED";

  const truncatePrompt = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + ".....";
  };

  // Polling for animation status
  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/ai/animation-status/${animation.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCurrentAnimation(data.data);
        
        // Update time estimates
        if (data.data.elapsedSeconds) {
          setElapsedTime(data.data.elapsedSeconds);
        }
        if (data.data.estimatedRemainingSeconds !== undefined) {
          setEstimatedRemaining(data.data.estimatedRemainingSeconds);
        }
        
        return data.data.status;
      }
    } catch (error) {
      console.error("Error polling status:", error);
    }
    return null;
  }, [animation.id]);

  // Start polling when rendering
  useEffect(() => {
    if (!isRendering) return;

    // Poll immediately on mount
    pollStatus();

    const pollInterval = setInterval(async () => {
      setPollingCount((prev) => prev + 1);
      const status = await pollStatus();

      if (status === "COMPLETED" || status === "FAILED") {
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 10 seconds for more responsive updates

    return () => clearInterval(pollInterval);
  }, [isRendering, pollStatus]);

  // Show success animation when completed
  useEffect(() => {
    if (isCompleted && currentAnimation.videoUrl) {
      setShowSuccessMessage(true);

      // Confetti animation
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
      };

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: colors,
      });

      frame();

      // Hide success message after 1.8 seconds
      setTimeout(() => setShowSuccessMessage(false), 1800);

      // Show video content after success message starts fading
      setTimeout(() => setShowContent(true), 1800);
    }
  }, [isCompleted, currentAnimation.videoUrl]);

  const handleDownload = async () => {
    if (downloadStatus !== "idle" || !currentAnimation.videoUrl) return;

    setDownloadStatus("downloading");
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(currentAnimation.videoUrl);
      const blob = await response.blob();

      clearInterval(progressInterval);
      setProgress(100);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `manimflow-${animation.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setDownloadStatus("downloaded");

      setTimeout(() => {
        setDownloadStatus("complete");
      }, 1500);

      // Reset to idle state
      setTimeout(() => {
        setDownloadStatus("idle");
        setProgress(0);
      }, 1600);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadStatus("idle");
      setProgress(0);
    }
  };

  const handleShare = () => {
    toast.success("Shareable link copied to clipboard!");
    navigator.clipboard.writeText(
      `${window.location.origin}/share/${animation.id}`,
    );

    setTimeout(() => {
      toast.dismiss();
      router.replace(`/share/${animation.id}`);
    }, 2000);
  };

  const handleRetry = () => {
    router.push("/dashboard");
  };

  // Parse and simplify error messages
  const getSimplifiedError = (error: string | null): { title: string; message: string; technical: string } => {
    if (!error) return { title: "Unknown Error", message: "An unexpected error occurred.", technical: "" };

    // Check for common error patterns
    if (error.includes("unsupported operand type(s) for -: 'method' and 'float'") || 
        error.includes(".get_center") || error.includes(".get_top") || 
        error.includes(".get_bottom") || error.includes(".get_left") || error.includes(".get_right")) {
      return {
        title: "Missing Parentheses Error",
        message: "The code is missing parentheses () after a method call like .get_center(). This is a common syntax error.",
        technical: error
      };
    }

    if (error.includes("FileNotFoundError") && (error.includes("latex") || error.includes("MathTex") || error.includes("Tex"))) {
      return {
        title: "LaTeX Not Installed",
        message: "MathTex requires LaTeX to be installed. Try using Text() for simple labels instead, or install MiKTeX on Windows.",
        technical: error
      };
    }

    if (error.includes("ModuleNotFoundError") || error.includes("ImportError")) {
      return {
        title: "Missing Dependency",
        message: "A required module is not installed. The code may be trying to import something that's not available.",
        technical: error
      };
    }

    if (error.includes("SyntaxError")) {
      return {
        title: "Python Syntax Error",
        message: "The generated code has a syntax error. Try regenerating the animation with a clearer prompt.",
        technical: error
      };
    }

    if (error.includes("TypeError")) {
      return {
        title: "Type Error",
        message: "The code is trying to use incompatible data types. This often happens with incorrect method calls.",
        technical: error
      };
    }

    // Default fallback
    return {
      title: "Rendering Error",
      message: "The animation failed to render. Try regenerating with a simpler or clearer prompt.",
      technical: error
    };
  };

  // Rendering state UI
  if (isRendering) {
    const formatTime = (seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };

    const progressPercentage = Math.min(
      95,
      (elapsedTime / (elapsedTime + estimatedRemaining)) * 100
    );

    return (
      <div className="min-h-screen bg-[#030303] text-foreground">
        {/* Header */}
        <header className="backdrop-blur-xl bg-[#030303] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Button
              onClick={() => router.replace("/dashboard")}
              className="flex text-black bg-white hover:bg-white/80 items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            {/* Animated spinner */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-neutral-800 border-t-white animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-mono text-neutral-400">
                  {Math.floor(progressPercentage)}%
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mt-4 mb-2">
              Rendering Your Animation
            </h2>
            <p className="text-neutral-400 text-center max-w-md mb-6">
              This may take several minutes depending on the complexity of your
              animation. Feel free to stay on this page - it will update
              automatically.
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md mb-6">
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Time estimates */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Elapsed Time</p>
                <p className="text-lg font-mono text-white">
                  {formatTime(elapsedTime)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">
                  Est. Remaining
                </p>
                <p className="text-lg font-mono text-white">
                  {estimatedRemaining > 0 ? formatTime(estimatedRemaining) : "Almost done..."}
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {currentAnimation.status === "GENERATING"
                  ? "Generating code..."
                  : "Rendering video..."}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Auto-checking status ({pollingCount} updates)</span>
            </div>

            <p className="text-xs text-neutral-600 mt-6 text-center max-w-sm">
              💡 Tip: You can leave this page and come back later. Your video
              will be ready when you return.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // Failed state UI
  if (isFailed) {
    const errorInfo = getSimplifiedError(currentAnimation.errorMessage);
    
    return (
      <div className="min-h-screen bg-[#030303] text-foreground">
        {/* Header */}
        <header className="backdrop-blur-xl bg-[#030303] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Button
              onClick={() => router.replace("/dashboard")}
              className="flex text-black bg-white hover:bg-white/80 items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {errorInfo.title}
            </h2>
            <p className="text-neutral-400 text-center max-w-md mb-4">
              {errorInfo.message}
            </p>

            {errorInfo.technical && (
              <details className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-2xl mt-4 w-full">
                <summary className="text-red-400 text-sm font-semibold cursor-pointer mb-2">
                  Show Technical Details
                </summary>
                <pre className="text-red-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap mt-2">
                  {errorInfo.technical}
                </pre>
              </details>
            )}

            <div className="flex gap-4 mt-8">
              <Button
                onClick={handleRetry}
                className="px-8 py-6 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            <p className="text-xs text-neutral-600 mt-6 text-center max-w-md">
              💡 Tip: Try simplifying your prompt or being more specific about what you want to see
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-foreground">
      {/* Header */}
      <header className=" backdrop-blur-xl bg-[#030303] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            onClick={() => router.replace("/dashboard")}
            className="flex text-black bg-white hover:bg-white/80 items-center gap-2 cursor-pointer transition-colors"
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
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
              <h1 className="text-white text-3xl font-bold mb-2">
                Successfully Rendered!!
              </h1>
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
            <div className="rounded-2xl overflow-hidden border">
              <div className="aspect-video">
                <VideoPlayer style={{ width: "100%", height: "100%" }}>
                  <VideoPlayerContent
                    src={currentAnimation.videoUrl || ""}
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
                className="rounded-2xl border border-[#333333] p-6 bg-[#151515]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-semibold text-white">
                    Prompt : {truncatePrompt(animation.prompt).toUpperCase()}
                  </h3>
                </div>
              </motion.div>

              {/* Download and Share Buttons Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl py-4 px-30 flex items-center justify-center gap-4"
              >
                {currentAnimation.videoUrl && (
                  <>
                    <DownloadButton
                      downloadStatus={downloadStatus}
                      progress={progress}
                      onClick={handleDownload}
                      className="px-12 py-6 w-48 bg-white hover:bg-white text-black hover:shadow-xl transition-shadow duration-300"
                    />
                    <Button
                      onClick={handleShare}
                      className="px-12 py-6 w-48 text-black bg-white font-semibold rounded-lg hover:shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Download Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4 pt-4"
            ></motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
