import { generateEveningFact } from "./generateFact.js";
import { postTweet } from "./twitterClient.js";

export async function postEveningFact() {
  console.log("[Evening] Job started.");
  try {
    const fact = await generateEveningFact();
    const trimmed = fact.length > 280 ? fact.slice(0, 277) + "…" : fact;

    await postTweet(trimmed);
    console.log("[Evening] Job finished.");
  } catch (err) {
    console.error("[Evening] Job failed:", err.message || err);
  }
}
