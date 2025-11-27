import { openai } from "./openaiCommon.js";

export async function generateReplyTweet(event) {
  const userPrompt = `
Add extra historical context and background about this event. 
Write 1–2 short sentences. 
No emojis.
No hashtags.

Event:
${event.description}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
      max_tokens: 180,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("[OpenAI reply tweet error]", err);
    return "Additional context unavailable.";
  }
}
