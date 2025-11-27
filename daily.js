import { getEventForDate } from "./fetchEvents.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateReplyTweet } from "./generateReply.js";
import { postTweet } from "./twitterClient.js";

export async function postDailyTweet() {
  try {
    const event = await getEventForDate();

    const today = new Date();
    event.monthName = today.toLocaleString("en-US", { month: "long" });
    event.day = today.getUTCDate();

    const mainTweet = await generateMainTweet(event);
    const replyTweet = await generateReplyTweet(event);

    // Main tweet
    const mainRes = await postTweet(mainTweet);
    const mainId = mainRes.data.id;

    // Reply tweet
    await postTweet(replyTweet, mainId);

    console.log("[Daily] Tweet + reply posted successfully.");
  } catch (err) {
    console.error("[Daily] error:", err);
  }
}

