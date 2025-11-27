import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// --- POST A SINGLE TWEET OR A REPLY ---
export async function postTweet(text, replyToId = null) {
  try {
    const res = await client.v2.tweet({
      text,
      reply: replyToId ? { in_reply_to_tweet_id: replyToId } : undefined,
    });
    return res;
  } catch (err) {
    console.error("[Twitter post error]", err);
    throw err;
  }
}

// --- POST A FULL THREAD (USED BY WEEKLY POST) ---
export async function postThread(tweets) {
  try {
    let lastId = null;

    for (const tweet of tweets) {
      const res = await client.v2.tweet({
        text: tweet,
        reply: lastId ? { in_reply_to_tweet_id: lastId } : undefined,
      });

      lastId = res.data.id;
    }

    console.log("[Twitter] Thread posted with", tweets.length, "tweets");
  } catch (err) {
    console.error("[Twitter thread error]", err);
    throw err;
  }
}

