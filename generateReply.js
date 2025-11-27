import { openai } from "./openaiCommon.js";

export async function generateReplyTweet(event) {
  const userPrompt = `
Write 1–2 short sentences giving extra historical context about this event.
Rules:
- No emojis
- No hashtags
- Clear, factual, neutral tone
- Max 280 characters

Event:
${event.description}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.5,
      max_tokens: 170,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("[OpenAI reply tweet error]", err);
    return "Additional context unavailable.";
  }
}

