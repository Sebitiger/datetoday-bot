import { getEventForDate } from "./fetchEvents.js";
import { generateWeeklyThread } from "./generateThread.js";
import { postThread } from "./twitterClient.js";

export async function postWeeklyThread() {
  console.log("[Weekly] Job started.");
  try {
    // By default we just reuse today's date.
    // You could change this to pick a random day in the last 7 days.
    const event = await getEventForDate();
    console.log("[Weekly] Event for thread:", event.year, "-", event.description.slice(0, 80), "...");

    const tweets = await generateWeeklyThread(event);

    await postThread(tweets);
    console.log("[Weekly] Job finished.");
  } catch (err) {
    console.error("[Weekly] Job failed:", err.message || err);
  }
}
