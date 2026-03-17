"use client";

import CopyButton from "./CopyButton";
import Editor from "@monaco-editor/react";

export default function CodeBlock({ code }: { code: string }) {
    // Monaco's default line height at fontSize 14 is 19px.
    // The editor adds 8px of top padding internally.
    // We add one extra line of height as breathing room at the bottom.
    const lineHeight = 19;
    const lineCount = code.split("\n").length;
    const height = lineCount * lineHeight + 8 + lineHeight;

    return (
        <div className="relative">
            <Editor
                className="rounded-xl overflow-hidden"
                height={`${height}px`}
                language="javascript"
                theme="vs-dark"
                value={code}
                options={{
                    guides: {
                        indentation: false,
                    },
                    readOnly: true,
                    domReadOnly: true,
                    contextmenu: false,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: false,
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        vertical: "hidden",
                        horizontal: "hidden",
                        alwaysConsumeMouseWheel: false,
                    },
                    matchBrackets: "never",
                    selectionHighlight: false,
                    occurrencesHighlight: "off",
                    renderLineHighlight: "none",
                    cursorStyle: "line",
                    cursorBlinking: "solid",
                    fontSize: 14,
                    lineHeight: lineHeight,
                    fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, Courier New, monospace",
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    padding: { top: 8, bottom: 8 },
                }}
            />
            <CopyButton text={code} />
        </div>
    );
}
