import { getEventForDate } from "./fetchEvents.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateReplyTweet } from "./generateReply.js";
import { postTweet, uploadImage } from "./twitterClient.js";
import { fetchEventImage } from "./fetchImage.js";

export async function postDailyTweet() {
  console.log("[Daily] Job started.");
  try {
    const event = await getEventForDate();
    console.log("[Daily] Selected event:", event.year, "-", event.description.slice(0, 80), "...");

    // Add date info for nicely formatted line 1
    const now = new Date();
    event.monthName = now.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    event.day = now.getUTCDate();

    // Prepare text
    const mainText = await generateMainTweet(event);
    const replyText = await generateReplyTweet(event);

    // Try to fetch a square image from Wikipedia
    let mediaIds = null;
    if (event.wikipediaTitle) {
      const imageBuffer = await fetchEventImage(event.wikipediaTitle);
      if (imageBuffer) {
        const mediaId = await uploadImage(imageBuffer);
        mediaIds = [mediaId];
      }
    }

    // Post main tweet (with image if available)
    const mainRes = await postTweet(mainText, null, mediaIds);
    const mainId = mainRes.data.id;

    // Post reply (no image)
    await postTweet(replyText, mainId);

    console.log("[Daily] Main tweet + reply posted successfully.");
  } catch (err) {
    console.error("[Daily] Job failed:", err.message || err);
  }
}
