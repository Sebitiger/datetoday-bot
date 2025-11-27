import { openai, SYSTEM_PROMPT } from "./openaiCommon.js";

export async function generateReplyTweet(event) {
  const userPrompt = `
You will create a short educational reply tweet AND a high-quality Britannica link.

Event description:
${event.description}

TASKS:

1) Write 2–3 concise, historian-style sentences explaining the significance of the event.
   - Neutral, factual tone.
   - No emojis.
   - No hashtags.
   - Max 230 characters (save room for the link).

2) Create a Britannica search link using the most probable subject:
   Format:
   https://www.britannica.com/search?query=<SEARCH_TERM>

3) Return the final reply tweet in this exact structure:

<Historian explanation>
🔗 Learn more: <Britannica link>

RULES:
- Use the event’s main subject as the search term (ex: “Coronation of Napoleon”).
- Do NOT invent facts not supported by the event description.
- The link must ALWAYS be to Britannica search.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Empty reply tweet from OpenAI");
    }

    return text;
  } catch (err) {
    console.error("[OpenAI reply tweet error]", err.message || err);
    return "Additional context unavailable.\n🔗 Learn more: https://www.britannica.com/";
  }
}
