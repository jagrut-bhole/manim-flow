"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Share2, Code } from "lucide-react";
import { motion } from "framer-motion";
import { VideoThumbnail } from "@/components/ui/VideoPlayer";
import { EditorView } from "@/components/Editor";
import DownloadButton from "@/components/ui/button-download";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextShimmer } from "@/components/ui/text-shimmer";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Animation {
  id: string;
  prompt: string;
  code: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: string;
  model: string;
  like: number;
  download: number;
}

interface ProfileData {
  animations: Animation[];
}

const CreationCard = ({
  animation,
  index,
}: {
  animation: Animation;
  index: number;
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "downloaded" | "complete"
  >("idle");
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (downloadStatus !== "idle" || !animation.videoUrl) return;

    setDownloadStatus("downloading");
    setProgress(0);

    try {
      // Simulate progress while downloading
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(animation.videoUrl);
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

      setTimeout(() => {
        setDownloadStatus("idle");
        setProgress(0);
      }, 1600);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download video");
      setDownloadStatus("idle");
      setProgress(0);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${animation.id}`;
    if (navigator.share) {
      await navigator.share({
        title: "Check out my Manim animation!",
        text: animation.prompt,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
  };

  return (
    <>
      <EditorView
        code={animation.code}
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        fileName={`animation-${animation.id}.py`}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a] transition-all duration-300 hover:border-white/30"
      >
        {/* Video Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
          {animation.videoUrl && <VideoThumbnail src={animation.videoUrl} />}

          {/* Animation ID */}
          <div className="absolute right-3 top-3 z-10">
            <span className="font-mono text-xs text-neutral-500">
              #{String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4 p-6">
          {/* Prompt */}
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Prompt
            </span>
            <p className="line-clamp-3 font-mono text-sm text-neutral-400">
              {animation.prompt}
            </p>
          </div>

          {/* Model & Date */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              {animation.model.replace("llama-", "").replace("-versatile", "")}
            </span>
            <span>{new Date(animation.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowEditor(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white text-black px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-200"
            >
              <Code className="size-5" />
              <span>View Code</span>
            </button>

            <DownloadButton
              downloadStatus={downloadStatus}
              progress={progress}
              onClick={handleDownload}
              className="flex-1 h-auto py-3"
            />

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-transparent px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/50 hover:bg-white/5"
            >
              <Share2 className="size-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const router = useRouter();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/auth/profile");
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <TextShimmer duration={2} className="text-xl font-mono">
          Loading your profile...
        </TextShimmer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              My Profile
            </h1>
            <p className="text-neutral-400">
              Manage your account and view your creations
            </p>
          </motion.div>

          {/* Profile Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-12"
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Account Details
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Name</p>
                    <p className="text-white font-medium">
                      {session?.user?.name || "User"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="text-white font-medium">
                      {session?.user?.email || "email@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">
                        {showPassword ? "••••••••••••" : "••••••••••••"}
                      </p>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-neutral-500 hover:text-white transition-colors"
                      ></button>
                    </div>
                  </div>
                </div>

                <Dialog
                  open={changePasswordOpen}
                  onOpenChange={setChangePasswordOpen}
                >
                  <DialogTrigger asChild>
                    <button className="cursor-pointer text-sm font-medium text-white hover:text-neutral-300 transition-colors">
                      Change Password
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new password to update
                        your credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-neutral-700 bg-[#0a0a0a] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={() => setChangePasswordOpen(false)}
                        className="w-full py-2.5 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* My Creations Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  My Creations
                </h2>
                <p className="text-neutral-400">
                  Your generated Manim animations
                </p>
              </div>
              <span className="text-sm text-neutral-500">
                {profile?.animations?.length || 0} creations
              </span>
            </div>

            {profile?.animations && profile.animations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12">
                {profile.animations.map((animation, index) => (
                  <CreationCard
                    key={animation.id}
                    animation={animation}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#0a0a0a] border border-neutral-800 rounded-2xl">
                <p className="text-neutral-400 mb-4">
                  You haven&apos;t created any animations yet.
                </p>
                <Button
                  onClick={() => router.replace("/dashboard")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                >
                  Create Your First Animation
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
