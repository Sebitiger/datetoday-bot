import fetch from "node-fetch";
import sharp from "sharp";

/**
 * Fetches a safe Wikimedia thumbnail using the REST API.
 * Avoids Cloudflare 403 errors from upload.wikimedia.org.
 *
 * Returns: Buffer or null
 */
export async function fetchEventImage(title) {
  try {
    if (!title) return null;

    // Format title into Wikipedia style
    const safeTitle = encodeURIComponent(title.replace(/\s+/g, "_"));

    // Wikimedia REST API: always safe, always returns an image
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

    if (!data?.thumbnail?.url) {
      console.log("[Image] No thumbnail returned from REST API.");
      return null;
    }

    // Fetch the actual image bytes
    const imgResponse = await fetch(data.thumbnail.url);
    if (!imgResponse.ok) {
      console.log("[Image] Failed to download thumbnail image:", imgResponse.status);
      return null;
    }

    const arrayBuf = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // Crop to square for Twitter
    const square = await sharp(buffer)
      .resize(1000, 1000, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toBuffer();

    return square;

  } catch (err) {
    console.error("[Image] Error processing image:", err.message);
    return null;
  }
}
