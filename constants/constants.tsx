import { Sparkles, Lock, Box } from 'lucide-react';
import { AIModel } from '../types/AiModels';

export interface PromptSet {
  prompts: string[];
}

export const MODELS = [
  { id: AIModel.GROQ_OLLAMA, name: 'Groq (Ollama)', locked: false, icon: <Box size={16} className="text-orange-400" /> },
  { id: AIModel.GOOGLE_GEMINI, name: 'Google Gemini', locked: false, icon: <Sparkles size={16} className="text-blue-400" /> },
  { id: AIModel.OPENAI_GPT3, name: 'OpenAI GPT 3.5', locked: true, icon: <Lock size={16} className="text-neutral-500" /> },
];

export const TYPEWRITER_PHRASES = [
  "Animate the derivative of sin(x) showing the tangent line",
  "Show how matrix multiplication transforms a 2D shape",
  "Visualize the Fourier series approximating a square wave",
  "Demonstrate the limit definition with epsilon-delta",
  "Animate sorting algorithms comparing bubble sort vs quicksort"
];
