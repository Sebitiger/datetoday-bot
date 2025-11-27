import fetch from "node-fetch";
import sharp from "sharp";

/**
 * Fetches a safe Wikimedia thumbnail using the REST API.
 * Logs everything for debugging.
 */
export async function fetchEventImage(title) {
  try {
    if (!title) {
      console.log("[Image] No Wikipedia title provided.");
      return null;
    }

    const safeTitle = encodeURIComponent(title.replace(/\s+/g, "_"));

    const apiUrl = `https://api.wikimedia.org/core/v1/wikipedia/en/page/${safeTitle}/thumbnail/800`;

    console.log("[Image] Trying Wikipedia title:", title);
    console.log("[Image] Using REST URL:", apiUrl);

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "DateTodayBot/1.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.log("[Image] REST API returned status:", res.status);
      return null;
    }

    const data = await res.json();

    if (!data?.thumbnail?.url) {
      console.log("[Image] REST API returned JSON but no thumbnail:", data);
      return null;
    }

    console.log("[Image] Found thumbnail URL:", data.thumbnail.url);

    const imgResponse = await fetch(data.thumbnail.url);

    if (!imgResponse.ok) {
      console.log("[Image] Could not download thumbnail:", imgResponse.status);
      return null;
    }

    const imgArray = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(imgArray);

    console.log("[Image] Thumbnail downloaded. Cropping...");

    const square = await sharp(buffer)
      .resize(1000, 1000, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log("[Image] Cropped image ready!");

    return square;

  } catch (err) {
    console.error("[Image] Unexpected error:", err.message);
    return null;
  }
}

