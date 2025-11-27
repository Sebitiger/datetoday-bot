import { getEventForDate } from "./fetchEvents.js";
import { generateTweetFromEvent } from "./generateTweet.js";
import { postTweet } from "./twitterClient.js";

export async function postDailyTweet() {
  console.log("[Daily] Job started.");
  try {
    const event = await getEventForDate();
    console.log("[Daily] Selected event:", event.year, "-", event.description.slice(0, 80), "...");
    const tweet = await generateTweetFromEvent(event);

    // Basic safety: ensure tweet length <= 280
    const trimmed = tweet.length > 280 ? tweet.slice(0, 277) + "…" : tweet;

    await postTweet(trimmed);
    console.log("[Daily] Job finished.");
  } catch (err) {
    console.error("[Daily] Job failed:", err.message || err);
  }
}
