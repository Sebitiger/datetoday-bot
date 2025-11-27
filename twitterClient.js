import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// Single tweet or reply, with optional media
export async function postTweet(text, replyToId = null, mediaIds = null) {
  try {
    const payload = {
      text,
    };

    if (replyToId) {
      payload.reply = { in_reply_to_tweet_id: replyToId };
    }

    if (mediaIds && mediaIds.length) {
      payload.media = { media_ids: mediaIds };
    }

    const res = await client.v2.tweet(payload);
    console.log("[Twitter] Tweet posted with id:", res.data?.id);
    return res;
  } catch (err) {
    console.error("[Twitter] Error posting tweet:", err?.data || err);
    throw err;
  }
}

// Thread for weekly posts
export async function postThread(tweets) {
  try {
    let lastId = null;

    for (const tweet of tweets) {
      const payload = {
        text: tweet,
      };
      if (lastId) {
        payload.reply = { in_reply_to_tweet_id: lastId };
      }

      const res = await client.v2.tweet(payload);
      lastId = res.data.id;
    }

    console.log("[Twitter] Thread posted with", tweets.length, "tweets");
  } catch (err) {
    console.error("[Twitter] Error posting thread:", err?.data || err);
    throw err;
  }
}

// Upload an image and return media ID
export async function uploadImage(buffer) {
  try {
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType: "image/jpeg" });
    console.log("[Twitter] Image uploaded, media id:", mediaId);
    return mediaId;
  } catch (err) {
    console.error("[Twitter] Error uploading image:", err?.data || err);
    throw err;
  }
}
