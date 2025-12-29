import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings2, Lock } from "lucide-react";
import { AIModel } from "../types/AiModels";
import { MODELS, TYPEWRITER_PHRASES } from "../constants/constants";
import { useTypewriter } from "../hooks/useTypewriter";

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  selectedModel,
  onModelChange,
}) => {
  const [internalSelectedModel, setInternalSelectedModel] = useState<AIModel>(
    AIModel.GROQ_OLLAMA,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const typewriterText = useTypewriter(TYPEWRITER_PHRASES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel = selectedModel || internalSelectedModel;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModelSelect = (model: any) => {
    if (model.locked) return;
    if (onModelChange) {
      onModelChange(model.id);
    } else {
      setInternalSelectedModel(model.id);
    }
    setIsDropdownOpen(false);
  };

  const currentModelData = MODELS.find((m) => m.id === activeModel);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && onSubmit) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="relative w-full bg-[#111111] border border-neutral-800 rounded-[2rem] p-4 transition-all focus-within:border-neutral-700 hover:border-neutral-700 shadow-2xl">
      <textarea
        className="w-full bg-transparent border-none focus:ring-0 outline-none text-xl text-white placeholder-neutral-600 resize-none min-h-30 max-h-100 custom-scrollbar mb-4 py-2 px-3"
        placeholder={typewriterText}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/50 transition-all text-sm font-medium outline-none"
            >
              {currentModelData?.icon}
              <span>{currentModelData?.name}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    disabled={model.locked}
                    onClick={() => handleModelSelect(model)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm outline-none
                      ${model.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-800"}
                      ${activeModel === model.id ? "bg-neutral-800" : ""}
                    `}
                  >
                    <div className="flex items-center gap-2.5 text-neutral-200">
                      {model.icon}
                      <span>{model.name}</span>
                    </div>
                    {model.locked && (
                      <Lock size={12} className="text-neutral-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Icon */}
          <button className="p-2.5 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors outline-none">
            <Settings2 size={18} />
          </button>

          {/* Send Button */}
          <button
            disabled={!value.trim()}
            onClick={handleSubmit}
            className={` cursor-pointer flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all duration-300 outline-none
              ${
                !value.trim()
                  ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                  : "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10 active:scale-95"
              }
            `}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
