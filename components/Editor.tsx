import { Editor } from "@monaco-editor/react";
import { X, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface EditorViewProps {
  code: string;
  isOpen?: boolean;
  onClose?: () => void;
  fileName?: string;
}

export const EditorView: React.FC<EditorViewProps> = ({
  code,
  isOpen,
  onClose,
  fileName = "MathVisual.py",
}) => {
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const EditorContent = (
    <div
      className={`${isOpen ? "h-[80vh] w-[90vw] max-w-6xl" : "h-160"} bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl`}
    >
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
              {fileName}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-2"
          >
            <Copy size={12} />
            Copy Code
          </button>
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily:
              "JetBrains Mono, Menlo, Monaco, Consolas, Courier New, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            readOnly: true,
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
  );

  if (isOpen !== undefined) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {EditorContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return EditorContent;
};
