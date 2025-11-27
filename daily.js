import { getEventForDate } from "./fetchEvents.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateReplyTweet } from "./generateReply.js";
import { postTweet } from "./twitterClient.js";

export async function postDailyTweet() {
  try {
    const event = await getEventForDate();

    // Add the month/day for formatting
    const dateObj = new Date();
    event.monthName = dateObj.toLocaleString("en-US", { month: "long" });
    event.day = dateObj.getUTCDate();

    const main = await generateMainTweet(event);
    const reply = await generateReplyTweet(event);

    // Post main tweet
    const mainRes = await postTweet(main);
    const mainId = mainRes.data.id;

    // Post the reply
    await postTweet(reply, mainId);

    console.log("[Daily] Tweet + reply posted.");
  } catch (err) {
    console.error("[Daily] error:", err);
  }
}
