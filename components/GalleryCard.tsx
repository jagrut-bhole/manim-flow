import { useState } from "react";
import { Copy, Check, Code, User } from "lucide-react";
import { motion } from "framer-motion";
import { VideoThumbnail } from "./ui/VideoPlayer";
import { EditorView } from "./Editor";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ExampleCardProps {
  id: number;
  title: string;
  prompt: string;
  author: string;
  videoSrc: string;
  isNew?: boolean;
  code?: string;
}

export const GalleryCard = ({
  id,
  title,
  prompt,
  author,
  videoSrc,
  isNew = false,
  code = "",
}: ExampleCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: id * 0.02 }}
      className="group relative overflow-hidden rounded-xl border border-transparent bg-[#0A0A0A] transition-all duration-300 hover:border-white"
    >
      {/* Video Section */}
      <div className="relative aspect-video w-full overflow-hidden">
        <VideoThumbnail src={videoSrc} />

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {isNew && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
              New
            </span>
          )}
        </div>

        {/* Component ID */}
        <div className="absolute right-3 top-3 z-10">
          <span className="font-mono text-xs text-muted-foreground/70">
            #{String(id).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4 p-5">
        {/* Title & Author */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User className="size-3.5" />
            <span>{author}</span>
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Prompt
          </span>
          <p className="line-clamp-2 font-mono text-sm text-white">{prompt}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleCopy}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
              copied
                ? "bg-white text-black hover:bg-white/90"
                : "bg-white text-black hover:bg-white/80",
            )}
          >
            {copied ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy Prompt
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowEditor(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-gray-400 transition-all duration-200 hover:text-white"
          >
            <Code className="size-4" />
            <span className="hidden sm:inline">View Code</span>
          </Button>
        </div>
      </div>

      {/* Editor Modal */}
      <EditorView
        code={code || `// ${title}\n// Example code coming soon...`}
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        fileName={`${title.replace(/\s+/g, "")}.tsx`}
      />

      {/* Hover Glow Effect - Removed background color */}
    </motion.div>
  );
};

export default GalleryCard;
