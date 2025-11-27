// generateTweet.js
import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

export async function generateMainTweet(event) {
  const { year, description, monthName, day } = event;

  const userPrompt = `
You are formatting a historical event into a clear, professional tweet.

Event:
${description}

Return EXACTLY 2–4 lines in this structure:

Line 1: "🗓️ On this day : ${monthName} ${day}, ${year}"
Line 2: one precise sentence with ONE leading emoji describing the main event.
Line 3 (optional): starts with "📜" and contains a real secondary detail in parentheses.
Line 4 (optional): starts with "📍" or location emoji with a real place.

Rules:
- Be factual, neutral, concise.
- No invented facts.
- No hashtags.
- No intro/outro text.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 220
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty main tweet.");

    return text;
  } catch (err) {
    console.error("[OpenAI main tweet error]", err.message);
    return `🗓️ On this day : ${monthName} ${day}, ${year}\n📜 ${description}`;
  }
}
