import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

export async function postTweet(status) {
  try {
    const res = await client.v2.tweet(status);
    console.log("[Twitter] Tweet posted with id:", res.data?.id);
    return res;
  } catch (err) {
    console.error("[Twitter] Error posting tweet:", err?.data || err);
    throw err;
  }
}

export async function postThread(tweets) {
  try {
    const res = await client.v2.tweetThread(tweets);
    console.log("[Twitter] Thread posted. Length:", tweets.length);
    return res;
  } catch (err) {
    console.error("[Twitter] Error posting thread:", err?.data || err);
    throw err;
  }
}
