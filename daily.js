// daily.js — FINAL FULL VERSION (keeps full structure, just fixed image integration)

import { getRandomEvent } from "./fetchEvents.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateReply } from "./generateReply.js";
import { fetchImage } from "./fetchImage.js";
import { postTweet, postTweetWithImage } from "./twitterClient.js";

export async function runDaily() {
  console.log("[RunDaily] starting…");

  try {
    console.log("[Daily] Job started.");

    // ----------------------------------------------------------
    // 1. Fetch random historical event
    // ----------------------------------------------------------
    const event = await getRandomEvent();
    console.log(
      `[Daily] Selected event: ${event.year} – ${event.description.substring(0, 100)}…`
    );

    // ----------------------------------------------------------
    // 2. Generate main tweet text
    // ----------------------------------------------------------
    const mainTweetText = await generateMainTweet(event);
    console.log("[Daily] Main tweet text generated.");

    // ----------------------------------------------------------
    // 3. Try to fetch a Wikipedia-based image
    // ----------------------------------------------------------
    console.log("[Daily] Attempting image fetch…");
    let imageBuffer = null;

    try {
      imageBuffer = await fetchImage(event);
      if (imageBuffer) {
        console.log("[Daily] Image fetched successfully.");
      } else {
        console.log("[Daily] No image found — proceeding without image.");
      }
    } catch (imgErr) {
      console.log("[Daily] Image fetch failed:", imgErr.message || imgErr);
    }

    // ----------------------------------------------------------
    // 4. Post the main tweet (with or without image)
    // ----------------------------------------------------------
    let mainTweetId;

    try {
      if (imageBuffer) {
        console.log("[Twitter] Posting main tweet WITH image…");
        mainTweetId = await postTweetWithImage(mainTweetText, imageBuffer);
      } else {
        console.log("[Twitter] Posting main tweet WITHOUT image…");
        mainTweetId = await postTweet(mainTweetText);
      }
      console.log("[Twitter] Main tweet posted. ID:", mainTweetId);
    } catch (postErr) {
      console.error("[Twitter ERROR posting main tweet]:", postErr);
      throw postErr; // stops the job, important
    }

    // ----------------------------------------------------------
    // 5. Generate reply text
    // ----------------------------------------------------------
    const replyText = await generateReply(event);

    // ----------------------------------------------------------
    // 6. Post reply under main tweet
    // ----------------------------------------------------------
    try {
      const replyId = await postTweet(replyText, mainTweetId);
      console.log("[Twitter] Reply posted. ID:", replyId);
      console.log("[Daily] Main tweet + reply posted successfully.");
    } catch (replyErr) {
      console.error("[Twitter ERROR posting reply]:", replyErr);
    }

  } catch (err) {
    console.error("[RunDaily ERROR]", err);
  }

  console.log("[RunDaily] done.");
}

// Allow command-line run
if (process.argv[1]?.includes("daily.js")) {
  runDaily();
}
