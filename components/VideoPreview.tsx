
import React from 'react';
import { Play, Maximize2, Terminal } from 'lucide-react';

export const PreviewView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex-1 bg-black border border-neutral-800 rounded-2xl overflow-hidden relative group shadow-inner">
        <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
           <div className="text-center space-y-6">
             <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-2xl mx-auto group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 cursor-pointer shadow-2xl">
                <Play className="text-white fill-white ml-1.5" size={32} />
             </div>
             <div className="space-y-1">
               <p className="text-neutral-200 text-lg font-semibold tracking-tight">Render Preview</p>
               <p className="text-neutral-500 text-sm">Manim engine is ready</p>
             </div>
           </div>
        </div>
        <div className="absolute top-4 left-4">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-neutral-800 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             Live Output
           </div>
        </div>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button className="p-2.5 bg-black/60 backdrop-blur-xl rounded-xl text-neutral-400 hover:text-white border border-neutral-800 transition-colors">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="h-56 bg-[#111111]/80 border border-neutral-800 rounded-2xl p-5 flex flex-col shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={14} className="text-neutral-500" />
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.15em]">System Log</h3>
        </div>
        <div className="flex-1 space-y-3 overflow-auto custom-scrollbar font-mono text-[11px]">
          <div className="flex gap-3">
            <span className="text-neutral-600 shrink-0">14:22:01</span>
            <span className="text-blue-400 font-semibold">[INFO]</span>
            <span className="text-neutral-400">{`Loading Manim GL context...`}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-neutral-600 shrink-0">14:22:05</span>
            <span className="text-blue-400 font-semibold">[INFO]</span>
            <span className="text-neutral-400">{`Importing LaTeX dependencies...`}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-neutral-600 shrink-0">14:22:08</span>
            <span className="text-emerald-400 font-semibold">[SUCCESS]</span>
            <span className="text-neutral-200">{`Scene 'MathVisual' successfully compiled.`}</span>
          </div>
          <div className="flex gap-3">
             <span className="text-neutral-600 shrink-0">14:22:12</span>
             <span className="text-amber-400 font-semibold">[WARN]</span>
             <span className="text-neutral-400">{`Hardware acceleration restricted by environment.`}</span>
          </div>
          <div className="flex gap-3">
             <span className="text-neutral-600 shrink-0">14:22:15</span>
             <span className="text-neutral-500 animate-pulse">{`Running rendering pass 1/1...`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
