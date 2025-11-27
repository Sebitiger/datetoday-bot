// twitterClient.js
import { TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET
});

export async function postTweet(text, mediaBuffer = null) {
  try {
    let mediaId = null;

    if (mediaBuffer) {
      const uploadRes = await client.v1.uploadMedia(mediaBuffer, { type: "image" });
      mediaId = uploadRes;
    }

    const res = await client.v2.tweet({
      text,
      ...(mediaId ? { media: { media_ids: [mediaId] } } : {})
    });

    console.log("[Twitter] Tweet posted with id:", res.data.id);
    return res.data.id;
  } catch (err) {
    console.error("[Twitter Error posting tweet]", err);
    throw err;
  }
}

export async function replyTweet(text, replyToId) {
  try {
    const res = await client.v2.tweet({
      text,
      reply: { in_reply_to_tweet_id: replyToId }
    });
    console.log("[Twitter] Reply posted:", res.data.id);
  } catch (err) {
    console.error("[Twitter reply error]", err);
  }
}
