import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

  export async function generateTweetFromEvent(event) {
    const { year, description, wikipediaTitle } = event;
    const base = `${year} — ${description}${wikipediaTitle ? " (Related: " + wikipediaTitle + ")" : ""}`;

    const userPrompt = `
Rewrite the following historical event into a sharp, engaging “On this day” tweet.
Requirements:
- max 260 characters
- no emojis, no hashtags
- start with: "On this day in ${year}," or "On this day —" if year is N/A
- one or two short sentences
- highlight why it matters

Event:
${base}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 160,
      });

      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("Empty tweet content from OpenAI");
      }
      console.log("[OpenAI] Generated daily tweet.");
      return text;
    } catch (err) {
      console.error("[OpenAI] Error generating tweet:", err.message || err);
      // Fallback minimal tweet
      return `On this day — ${year}: ${description}`;
    }
  }
