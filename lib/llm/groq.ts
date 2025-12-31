import Groq from "groq-sdk";
import { cleanManimCode, MANIM_SYSTEM_PROMPT } from "./prompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateWithGroq(userPrompt: string) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: MANIM_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
    });

    const rawCode = completion.choices[0]?.message?.content || "";
    const cleanedCode = cleanManimCode(rawCode);

    return {
      success: true,
      code: cleanedCode,
      model: "llama-3.3-70b-versatile",
      provider: "groq",
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error: any) {
    console.error("Groq API error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate code with groq.",
      provider: "groq",
    };
  }
}
