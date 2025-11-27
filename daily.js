import { fetchEventImage } from "./fetchImage.js";
import { postTweet } from "./twitterClient.js";
import { generateTweetText } from "./generateTweet.js";
import { generateReplyTweet } from "./generateReply.js";
import fetch from "node-fetch";

/**
 * Fetch today's historical events using Byabbe API
 */
async function fetchEvents() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;

  console.log("[Events] Fetching events from:", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch events");

  const data = await res.json();
  return data.events;
}

/**
 * Select a single event (random but weighted toward high-impact topics)
 */
function pickEvent(events) {
  // Filter out trivial events
  const filtered = events.filter(ev => {
    const text = ev.description.toLowerCase();
    return !(
      text.includes("sports") ||
      text.includes("baseball") ||
      text.includes("football") ||
      text.includes("cricket") ||
      text.includes("tennis") ||
      text.includes("golf") ||
      text.includes("olympics") ||
      text.includes("award") ||
      text.includes("music") ||
      text.includes("film")
    );
  });

  const usable = filtered.length > 0 ? filtered : events;

  const chosen = usable[Math.floor(Math.random() * usable.length)];

  // Extract Wikipedia title from event.wikipedia array
  let wikipediaTitle = null;
  if (chosen.wikipedia && chosen.wikipedia.length > 0) {
    wikipediaTitle = chosen.wikipedia[0].title;
  }

  return {
    year: chosen.year,
    description: chosen.description,
    wikipediaTitle
  };
}

/**
 * Build multiple candidate titles for image search.
 */
function getImageTitleCandidates(event) {
  const titles = [];

  // 1) Use API-provided title if present
  if (event.wikipediaTitle) {
    titles.push(event.wikipediaTitle);
  }

  const desc = event.description || "";
  if (!desc) return titles;

  // 2) Try to extract names (capitalized sequences)
  const searchZone = desc.includes(":") ? desc.split(":")[1] : desc;

  const nameRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;

  const blacklist = [
    "War", "Revolution", "Empire", "Republic", "Kingdom",
    "Civil", "World", "Treaty", "Agreement", "Act",
    "Conference", "Battle", "Siege"
  ];

  let match;
  const found = [];

  while ((match = nameRegex.exec(searchZone)) !== null) {
    const name = match[1].trim();
    const block = blacklist.some(b => name.includes(b));
    if (!block) found.push(name);
  }

  for (const n of found) {
    if (!titles.includes(n)) titles.push(n);
  }

  // 3) Fallback
  if (titles.length === 0) {
    titles.push(desc.split("–")[0].trim());
  }

  console.log("[Daily] Image title candidates:", titles);
  return titles;
}

/**
 * MAIN: Run the daily post
 */
export async function runDaily() {
  console.log("[RunDaily] starting…");

  try {
    const events = await fetchEvents();
    const event = pickEvent(events);

    console.log("[Daily] Selected event:", event.year, "–", event.description);

    // Build the X text
    const mainTweetText = await generateTweetText(event);
    const replyTweetText = await generateReplyTweet(event);

    // Build image title candidates
    const candidates = getImageTitleCandidates(event);

    // Fetch image using the smart multi-title system
    const imageBuffer = await fetchEventImage(candidates);

    // Post main tweet (with or without image)
    const mainTweetId = await postTweet(mainTweetText, imageBuffer);
    console.log("[Twitter] Tweet posted with id:", mainTweetId);

    // Post reply
    const replyId = await postTweet(replyTweetText, null, mainTweetId);
    console.log("[Twitter] Reply posted with id:", replyId);

    console.log("[Daily] Main tweet + reply posted successfully.");

  } catch (err) {
    console.error("[Daily] Job failed:", err.message);
  }

  console.log("[RunDaily] done.");
}
