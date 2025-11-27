// daily.js — stable working version (NO IMAGES)

import { getRandomEvent } from "./fetchEvents.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateReply } from "./generateReply.js";
import { postTweet } from "./twitterClient.js";

export async function runDaily() {
  console.log("[RunDaily] starting…");

  try {
    // 1. Pick a random historical event
    const event = await getRandomEvent();
    console.log(
      `[Daily] Selected event: ${event.year} – ${event.description.substring(0, 100)}…`
    );

    // 2. Generate the main tweet text
    const mainTweetText = await generateMainTweet(event);
    console.log("[Daily] Main tweet generated.");

    // 3. Post main tweet (text only)
    const mainTweetId = await postTweet(mainTweetText);
    console.log("[Twitter] Main tweet posted, id:", mainTweetId);

    // 4. Generate reply tweet
    const replyText = await generateReply(event);

    // 5. Post reply under main tweet
    await postTweet(replyText, mainTweetId);
    console.log("[Twitter] Reply posted.");

  } catch (err) {
    console.error("[RunDaily ERROR]", err.message || err);
  }

  console.log("[RunDaily] done.");
}

// Allow CLI run
if (process.argv[1]?.includes("daily.js")) {
  runDaily();
}
