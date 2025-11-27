import { openai } from "./openaiCommon.js";

export async function generateMainTweet(event) {
  const { year, description, monthName, day } = event;

  const userPrompt = `
Rewrite the historical event below into a sharp, modern main tweet.

Rules:
- Start with "🗓️ On this day — ${monthName} ${day}, ${year}:"
- Keep it under 230 characters
- Add 2–3 relevant emojis
- Make it punchy and engaging
- Keep the core fact accurate
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
    return `🗓️ On this day — ${monthName} ${day}, ${year}: ${description}`;
  }
}
