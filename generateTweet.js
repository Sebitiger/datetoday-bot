import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

export async function generateMainTweet(event) {
  const { year, description, monthName, day } = event;

  const userPrompt = `
You are formatting a historical event into a clear, professional tweet.

Event:
${description}

Return EXACTLY 3–4 lines in this structure:

Line 1: "🗓️ On this day : ${monthName} ${day}, ${year}"
Line 2: one short sentence with ONE leading emoji describing the main event (e.g. "👑 Napoleon was crowned Emperor of the French")
Line 3: optional extra detail in parentheses with a leading emoji like 📜 (calendar, secondary dating system, treaty name, etc.) – only if relevant
Line 4: optional location line with a leading emoji like 📍 or ⛪ (e.g. "⛪ at Notre-Dame de Paris in Paris.")

Rules:
- Keep it factual and professional.
- No hashtags.
- No extra lines before or after.
- If you don't know a secondary date or location, simply omit that line.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 220,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("[OpenAI main tweet error]", err);
    // Simple fallback with just first two lines
    return `🗓️ On this day : ${monthName} ${day}, ${year}
📜 ${description}`;
  }
}
