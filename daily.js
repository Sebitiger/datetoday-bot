// daily.js

import { getRandomEvent } from "./fetchEvents.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateReply } from "./generateReply.js";
import { fetchEventImage } from "./fetchImage.js";
import { postTweet, postTweetWithImage } from "./twitterClient.js";

export async function runDaily() {
  console.log("[RunDaily] starting…");

  try {
    // 1. Fetch a random historical event
    const event = await getRandomEvent();
    console.log(
      "[Daily] Selected event:",
      event.year,
      "-",
      event.description?.slice(0, 120) || ""
    );

    // 2. Generate main tweet text
    const mainTweetText = await generateMainTweet(event);
    console.log("[Daily] Main tweet text generated.");

    // 3. Try to fetch an image for the event
    let imageBuffer = null;
    try {
      console.log("[Daily] Attempting to fetch image…");
      imageBuffer = await fetchEventImage(event);
      if (imageBuffer) {
        console.log("[Daily] Image fetched successfully.");
      } else {
        console.log("[Daily] No image found, posting text-only.");
      }
    } catch (imgErr) {
      console.error("[Daily] Image fetch error:", imgErr.message || imgErr);
    }

    // 4. Post main tweet (with or without image)
    let mainTweetId;
    if (imageBuffer) {
      mainTweetId = await postTweetWithImage(mainTweetText, imageBuffer, null);
    } else {
      mainTweetId = await postTweet(mainTweetText, null);
    }
    console.log("[Daily] Main tweet posted. ID:", mainTweetId);

    // 5. Generate reply
    const replyText = await generateReply(event);

    // 6. Post reply under main tweet (no image)
    await postTweet(replyText, mainTweetId);
    console.log("[Daily] Reply posted under main tweet.");

  } catch (err) {
    console.error("[RunDaily ERROR]", err);
  }

  console.log("[RunDaily] done.");
}

// Allow running directly with: node daily.js
if (process.argv[1]?.includes("daily.js")) {
  runDaily();
}
