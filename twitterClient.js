import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

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
