// daily.js — MAIN DAILY SCRIPT
import fetch from "node-fetch";
import { postTweet, postReply, postTweetWithImage } from "./twitterClient.js";
import { generateMainTweet } from "./generateTweet.js";
import { generateImageFromTitle } from "./fetchImage.js";

// Fetch events from ByAbbe API
async function fetchEvents() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;
  console.log(`[Events] Fetching events from: ${url}`);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.events;
  } catch (err) {
    console.error("[Events] Error fetching events:", err.message);
    return [];
  }
}

// Select a random event (medium randomness)
function chooseRandomEvent(events) {
  if (!events || events.length === 0) return null;
  const index = Math.floor(Math.random() * events.length);
  return events[index];
}

// Build the "event object" with date metadata
function formatEvent(rawEvent) {
  const today = new Date();
  const monthName = today.toLocaleString("en-US", { month: "long" });
  const day = today.getDate();

  return {
    year: rawEvent.year,
    description: rawEvent.description,
    wikipedia: rawEvent.wikipedia, 
    monthName,
    day,
  };
}

export async function runDaily() {
  console.log("[RunDaily] starting…");

  // 1) Fetch events
  const events = await fetchEvents();
  if (events.length === 0) {
    console.error("[Daily] No events found.");
    return;
  }

  // 2) Select event
  const selected = chooseRandomEvent(events);
  const event = formatEvent(selected);

  console.log("[Daily] Selected event:", event.year, "–", event.description.substring(0, 80), "...");

  // 3) Generate the main tweet text with OpenAI
  const mainTweetText = await generateMainTweet(event);

  // 4) Try fetching an image
  let mediaId = null;
  try {
    console.log("[Image] Generating image request from:", event.description);
    mediaId = await generateImageFromTitle(event.description);

    if (!mediaId) {
      console.log("[Image] No image generated. Posting text-only tweet.");
    }
  } catch (err) {
    console.error("[Image] Error:", err);
  }

  // 5) Post the main tweet (with image if possible)
  let mainTweetId = null;
  try {
    if (mediaId) {
      mainTweetId = await postTweetWithImage(mainTweetText, mediaId);
    } else {
      mainTweetId = await postTweet(mainTweetText);
    }
    console.log("[Twitter] Main tweet posted with id:", mainTweetId);
  } catch (err) {
    console.error("[Twitter] Error posting main tweet:", err);
    return;
  }

  // 6) Generate reply explanatory tweet
  const replyText =
    `${event.description}\n\n` +
    `This event took place in ${event.year}.`;

  // 7) Post reply
  try {
    const replyId = await postReply(replyText, mainTweetId);
    console.log("[Twitter] Reply posted with id:", replyId);
  } catch (err) {
    console.error("[Twitter] Reply error:", err);
  }

  console.log("[RunDaily] done.");
}
