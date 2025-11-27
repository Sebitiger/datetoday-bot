import fetch from "node-fetch";
import sharp from "sharp";

/**
 * Try to fetch an image for one title using Wikimedia REST API.
 * Returns a cropped square Buffer, or null if nothing works.
 */
async function fetchImageForTitle(title) {
  try {
    if (!title) {
      console.log("[Image] Skipping empty title.");
      return null;
    }

    const safeTitle = encodeURIComponent(title.replace(/\s+/g, "_"));
    const apiUrl = `https://api.wikimedia.org/core/v1/wikipedia/en/page/${safeTitle}/thumbnail/800`;

    console.log("[Image] Trying title:", title);
    console.log("[Image] REST URL:", apiUrl);

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "HerodotusDailyBot/1.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      console.log("[Image] REST API status for", title, "=>", res.status);
      return null;
    }

    const data = await res.json();

    if (!data?.thumbnail?.url) {
      console.log("[Image] No thumbnail in REST response for", title);
      return null;
    }

    console.log("[Image] Thumbnail URL for", title, "=>", data.thumbnail.url);

    const imgResponse = await fetch(data.thumbnail.url);
    if (!imgResponse.ok) {
      console.log("[Image] Failed to download thumbnail for", title, "=>", imgResponse.status);
      return null;
    }

    const bufArray = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(bufArray);

    // Crop to square for X
    const square = await sharp(buffer)
      .resize(1000, 1000, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log("[Image] Cropped square image ready for", title);
    return square;

  } catch (err) {
    console.error("[Image] Error with title", title, "=>", err.message);
    return null;
  }
}

/**
 * Main function used by the bot.
 * Accepts either a single string or an array of title candidates.
 * Tries each one until one image works.
 */
export async function fetchEventImage(titleOrTitles) {
  const titles = Array.isArray(titleOrTitles) ? titleOrTitles : [titleOrTitles];

  for (const t of titles) {
    const buffer = await fetchImageForTitle(t);
    if (buffer) {
      return buffer;  // done, we found an image
    }
  }

  console.log("[Image] No image found for any candidate title:", titles);
  return null;
}
