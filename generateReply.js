import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

export async function generateReply(event) {
  const userPrompt = `
Write 2–3 short, factual sentences explaining the historical significance of this event.

Event:
${event.description}

Rules:
- Tone: neutral, educational, modern historian.
- Only verified context. Do NOT invent dates, locations, or interpretations.
- No emojis.
- No hashtags.
- Max 280 characters.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty reply tweet from OpenAI");
    }
    return text;
  } catch (err) {
    console.error("[OpenAI reply tweet error]", err.message || err);
    return "Additional context unavailable.";
  }
}
