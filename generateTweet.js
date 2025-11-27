import { openai } from "./openaiCommon.js";

export async function generateMainTweet(event) {
  const { year, description } = event;

  const userPrompt = `
Rewrite the following historical fact as a short, emoji-friendly main tweet.

Rules:
- Start with the exact date: "🗓️ On this day – ${event.monthName} ${event.day}, ${year}"
- Include 2–3 relevant emojis (allowed)
- Make it punchy and clear
- Max 230 characters
- No hashtags

Event:
${description}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 160,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("[OpenAI main tweet error]", err);
    return `🗓️ On this day – ${event.monthName} ${event.day}, ${year}: ${description}`;
  }
}
