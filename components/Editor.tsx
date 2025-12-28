import { Editor } from "@monaco-editor/react";

interface EditorViewProps {
  code: string;
}

export const EditorView: React.FC<EditorViewProps> = ({ code }) => {
  return (
    <div className="h-160 bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/50 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 uppercase tracking-widest">python</span>
            <span className="text-xs font-mono text-neutral-300">MathVisual.py</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
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
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, Courier New, monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            readOnly: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
          }}
        />
      </div>
    </div>
  )
}