import { generateWithGemini } from "./gemini";
import { generateWithGroq } from "./groq";

export type LLMProvider = "gemini" | "groq";

export interface GenerateCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
  model?: string;
  provider?: string;
  tokensUsed?: number;
}

export async function generateManimCode(
  userPrompt: string,
  provider: LLMProvider = "groq",
): Promise<GenerateCodeResponse> {
  if (!userPrompt || userPrompt.trim().length < 10) {
    return {
      success: false,
      error: "Please provide a more detailed prompt (at least 10 characters)",
    };
  }

  switch (provider) {
    case "groq":
      return await generateWithGroq(userPrompt);

    case "gemini":
      return await generateWithGemini(userPrompt);

    default:
      return {
        success: false,
        error: "Invalid LLM provider selected.",
      };
  }
}
