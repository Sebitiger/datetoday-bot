// twitterClient.js

import { TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

/**
 * Post a tweet without image.
 * If replyToId is provided, posts as a reply.
 */
export async function postTweet(text, replyToId = null) {
  try {
    const payload = { text };

    if (replyToId) {
      payload.reply = { in_reply_to_tweet_id: replyToId };
    }

    const res = await client.v2.tweet(payload);
    const tweetId = res.data.id;
    console.log("[Twitter] Tweet posted. ID:", tweetId);
    return tweetId;
  } catch (err) {
    console.error("[Twitter] Error posting tweet:", err);
    throw err;
  }
}

/**
 * Post a tweet with an image (Buffer).
 * If replyToId is provided, posts as a reply.
 */
export async function postTweetWithImage(text, imageBuffer, replyToId = null) {
  try {
    let mediaId = null;

    if (imageBuffer) {
      console.log("[Twitter] Uploading media…");
      mediaId = await client.v1.uploadMedia(imageBuffer, { type: "image" });
      console.log("[Twitter] Media uploaded. ID:", mediaId);
    }

    const payload = { text };

    if (mediaId) {
      payload.media = { media_ids: [mediaId] };
    }

    if (replyToId) {
      payload.reply = { in_reply_to_tweet_id: replyToId };
    }

    const res = await client.v2.tweet(payload);
    const tweetId = res.data.id;
    console.log("[Twitter] Tweet with image posted. ID:", tweetId);
    return tweetId;
  } catch (err) {
    console.error("[Twitter] Error posting tweet with image:", err);
    throw err;
  }
}
