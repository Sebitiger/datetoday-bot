import fetch from "node-fetch";
import sharp from "sharp";

/**
 * Fetches a safe Wikimedia thumbnail (always JPG/PNG, always accessible).
 * Avoids Cloudflare 403 errors from upload.wikimedia.org.
 *
 * Returns: Buffer or null
 */
export async function fetchEventImage(title) {
  try {
    if (!title) return null;

    // Encode title for URL
    const safeTitle = encodeURIComponent(title.replace(/\s+/g, "_"));

    // Wikimedia REST API (safe, stable, no 403)
    const apiUrl = `https://api.wikimedia.org/core/v1/wikipedia/en/page/${safeTitle}/thumbnail/800`;

    console.log("[Image] Fetching REST thumbnail:", apiUrl);

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "DateTodayBot/1.0 (https://twitter.com/)",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.log("[Image] Thumbnail fetch failed:", res.status);
      return null;
    }

    const data = await res.json();

    if (!data || !data.thumbnail || !data.thumbnail.url) {
      console.log("[Image] No thumbnail available.");
      return null;
    }

    // Now fetch the thumbnail image as buffer
    const imgRes = await fetch(data.thumbnail.url);
    if (!imgRes.ok) {
      console.log("[Image] Failed to fetch thumbnail file:", imgRes.status);
      return null;
    }

    const imgBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(imgBuffer);

    // Crop center square for X
    const cropped = await sharp(buffer)

