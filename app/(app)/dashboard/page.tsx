"use client";

import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { PromptInput } from "@/components/PromptInput";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIModel } from "@/types/AiModels";
import { MODELS } from "@/constants/constants";
import { EditorView } from "@/components/Editor";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

import { PromptSuggestions } from "@/components/PromptSuggestions";
import { PromptWarning } from "@/components/PromptWarning";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user: User = session?.user;

  const router = useRouter();

  const [inputText, setInputText] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    AIModel.GROQ_OLLAMA,
  );
  const [animationId, setAnimationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const handleInfoClick = () => {
    setShowWarningModal(true);
  };

  const handleSuggestionClick = () => {
    const suggestions = PromptSuggestions()[0].prompts;
    const randomIndex = Math.floor(Math.random() * suggestions.length);
    const selectedPrompt = suggestions[randomIndex];

    setIsTyping(true);
    setInputText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i <= selectedPrompt.length) {
        setInputText(selectedPrompt.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter a prompt to generate the animation.");
      return;
    }

    setIsSubmitted(true);
    setIsLoading(true);
    setError("");

    try {
      // Determine provider based on selected model
      const provider =
        selectedModel === AIModel.GOOGLE_GEMINI ? "gemini" : "groq";

      const response = await axios.post("/api/ai/generate-code", {
        prompt: inputText,
        provider: provider,
      });

      if (response.data.success && response.data.data?.code) {
        setGeneratedCode(response.data.data.code);
        setAnimationId(response.data.data.animationId);
        toast.success("Code generated successfully!");
      } else {
        const errorMsg = response.data.message || "Failed to generate code.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "An error occurred while generating code";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Generate code error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenderButton = async () => {
    if (!animationId || !generatedCode) {
      toast.error("Missing animation data.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/ai/render-video", {
        animationId: animationId,
        code: generatedCode,
      });

      if (response.data.success) {
        toast.success("Video rendering started! Redirecting to status page...");
        // Navigate to result page which will handle polling
        router.push(`/result/${animationId}`);
      } else {
        throw new Error(
          response.data.message || "Failed to start video rendering",
        );
      }
    } catch (error: any) {
      console.error("Render Video Error: ", error);
      const errorMsg =
        error.response?.data?.message || "Failed to start video rendering.";
      toast.error(errorMsg);
      setIsLoading(false);
    }
    // Don't set isLoading to false here - we're navigating away
  };

  const selectedModelData = MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-white overflow-x-hidden">
      <Navbar />
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="initial"
              className="flex-1 flex flex-col items-center justify-center"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-center mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-6xl font-semibold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-b from-white via-white to-neutral-500">
                  Where ideas become reality
                </h1>
              </motion.div>

              <motion.div
                layoutId="prompt-container"
                className="w-full max-w-4xl"
              >
                <PromptInput
                  value={inputText}
                  onChange={setInputText}
                  onSubmit={handleSubmit}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  onInfoClick={handleInfoClick}
                  onSuggestionClick={handleSuggestionClick}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="submitted"
              className="flex flex-col h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Top Bar with Compact Prompt */}
              <div className="flex justify-end mb-8 mt-15">
                <motion.div
                  layoutId="prompt-container"
                  className="bg-[#111111] border border-neutral-800 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl"
                >
                  <span className="text-neutral-200 max-w-md truncate">
                    {inputText}
                  </span>
                  <div className="w-px h-4 bg-neutral-800" />
                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    {selectedModelData?.icon}
                    <span>{selectedModelData?.name}</span>
                  </div>
                </motion.div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto w-full">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <TextShimmer
                        duration={1.5}
                        className="text-base font-mono "
                      >
                        {/*  [--base-color:var(--color-blue-600)] [--base-gradient-color:var(--color-blue-200)] dark:[--base-color:var(--color-blue-700)] dark:[--base-gradient-color:var(--color-blue-400)] */}
                        {generatedCode
                          ? "Generating your animation..."
                          : "Generating the code..."}
                      </TextShimmer>
                    </div>
                  </motion.div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setError("");
                      }}
                      className="text-neutral-400 hover:text-white transition-colors underline"
                    >
                      Try again
                    </Button>
                  </div>
                ) : generatedCode ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <EditorView code={generatedCode} />

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleRenderButton()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                      >
                        Render Video
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PromptWarning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowWarningModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWarningModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
              >
                <svg
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <div className="p-6">
                <PromptWarning />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
