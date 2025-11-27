// generateTweet.js — stable, working version

import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

export async function generateMainTweet(event) {
  const { year, description, monthName, day } = event;

  const userPrompt = `
You are formatting a historical event into a clear, professional tweet.

Event:
${description}

Return EXACTLY 2–4 lines in this structure:

Line 1: "🗓️ On this day : ${monthName} ${day}, ${year}"
Line 2: a precise sentence with ONE leading emoji describing the main event.
Line 3 (optional): starts with "📜" and contains a real secondary detail.
Line 4 (optional): starts with "📍" with a real location.

Rules:
- No invented facts.
- No hashtags.
- No extra lines.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ]
  });

  const text = completion.choices[0]?.message?.content?.trim();
  return text;
}
