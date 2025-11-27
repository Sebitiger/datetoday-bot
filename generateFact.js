import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

  export async function generateEveningFact() {
    const userPrompt = `
Create one short, surprising historical fact that makes the reader feel smarter.
Requirements:
- max 230 characters
- no emojis, no hashtags
- must be factually correct (widely documented in history)
- one or two short sentences
- do NOT reference "today" or a specific date
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 160,
      });

      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("Empty fact content from OpenAI");
      }
      console.log("[OpenAI] Generated evening fact.");
      return text;
    } catch (err) {
      console.error("[OpenAI] Error generating evening fact:", err.message || err);
      return "History is full of turning points that began with small, unnoticed decisions.";
    }
  }
