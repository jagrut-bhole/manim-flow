import { MANIM_SYSTEM_PROMPT, cleanManimCode } from "./prompts";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function generateWithGemini(userPrompt: string) {
  try {
    const model = google("gemini-1.5-pro");

    const response = await generateText({
      model,
      messages: [
        {
          role: "system",
          content: MANIM_SYSTEM_PROMPT,
        },
        {
          role: "assistant",
          content:
            "I understand. I will generate only executable Manim Python code without any explanations or markdown formatting.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const cleanedCode = cleanManimCode(response.text);

    return {
      success: true,
      code: cleanedCode,
      model: "gemini-1.5-pro",
      provider: "gemini",
      tokensUsed: response.usage?.totalTokens || 0,
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate code with Gemini.",
      provider: "gemini",
    };
  }
}
