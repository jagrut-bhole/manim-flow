import { Sparkles, Lock, Box } from "lucide-react";
import { AIModel } from "../types/AiModels";

export interface PromptSet {
  prompts: string[];
}

export const MODELS = [
  {
    id: AIModel.GROQ_OLLAMA,
    name: "Base Model",
    locked: false,
    icon: <Box size={16} className="text-orange-400" />,
  },
  {
    id: AIModel.GOOGLE_GEMINI,
    name: "Thinking Model",
    locked: false,
    icon: <Sparkles size={16} className="text-blue-400" />,
  },
  // {
  //   id: AIModel.OPENAI_GPT3,
  //   name: "Intelligent Model",
  //   locked: true,
  //   icon: <Lock size={16} className="text-neutral-500" />,
  // },
];

export const TYPEWRITER_PHRASES = [
  "Animate the derivative of sin(x) showing the tangent line",
  "Show how matrix multiplication transforms a 2D shape",
  "Visualize the Fourier series approximating a square wave",
  "Demonstrate the limit definition with epsilon-delta",
  "Animate sorting algorithms comparing bubble sort vs quicksort",
];

export const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: " forever",
    description: "Perfect for getting started and experimenting",
    features: [
      "30 credits per month",
      "480p video quality",
    ],
    cta: "Get Started Free",
    available: true,
  },
  {
    name: "Pro",
    price: "₹199",
    period: " per month",
    description: "For power users who need more",
    badge: "Coming Soon",
    features: [
      "60 credits per month",
      "720p & 1080p video quality",
    ],
    cta: "Get Pro",
    available: true,
  },
  {
    name: "Credit Pack",
    price: "₹99",
    period: " one time",
    description: "Need a quick top-up? Buy credits as you go.",
    badge: "Popular",
    features: [
      "30 instant credits",
      "High video quality",
      "Never expires",
    ],
    cta: "Buy Credits",
    available: true,
  },
];