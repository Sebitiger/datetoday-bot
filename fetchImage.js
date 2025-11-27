import axios from "axios";
import sharp from "sharp";

const WIKI_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary/";

export async function fetchEventImage(title) {
  if (!title) {
    console.log("[Image] No Wikipedia title, skipping image.");
    return null;
  }

  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `${WIKI_SUMMARY_BASE}${encodedTitle}`;
    console.log("[Image] Fetching Wikipedia summary for:", title);

    const { data } = await axios.get(url, { timeout: 10000 });

    const imageUrl =
      data.originalimage?.source ||
      data.thumbnail?.source ||
      null;

    if (!imageUrl) {
      console.log("[Image] No image available on Wikipedia for this event.");
      return null;
    }

    console.log("[Image] Downloading image from:", imageUrl);
    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000
    });

    const inputBuffer = Buffer.from(imgRes.data);

    // Use sharp to crop to center square and resize to 1024x1024
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    const size = Math.min(metadata.width || 0, metadata.height || 0);
    if (!size || size <= 0) {
      console.log("[Image] Invalid image dimensions, skipping.");
      return null;
    }

    const left = Math.floor(((metadata.width || size) - size) / 2);
    const top = Math.floor(((metadata.height || size) - size) / 2);

    const squareBuffer = await image
      .extract({ left, top, width: size, height: size })
      .resize(1024, 1024)
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log("[Image] Square image prepared.");
    return squareBuffer;
  } catch (err) {
    console.error("[Image] Error fetching or processing image:", err.message || err);
    return null;
  }
}
