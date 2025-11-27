// fetchImage.js
import fetch from "node-fetch";

export async function fetchImage(event) {
  try {
    const title = event.wikipediaTitle || event.description.split(":")[0];

    // 1) TRY: Wikimedia REST API (square crop, 800px)
    const restUrl = `https://api.wikimedia.org/core/v1/wikipedia/en/page/${encodeURIComponent(
      title
    )}/thumbnail/800`;

    const restRes = await fetch(restUrl);

    if (restRes.ok) {
      const buff = Buffer.from(await restRes.arrayBuffer());
      return buff;
    }

    console.log("[Image] REST thumbnail failed → trying fallback…");

    // 2) TRY: Traditional API: get main image name
    const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=${encodeURIComponent(
      title
    )}`;
    const infoRes = await fetch(infoUrl).then((r) => r.json());

    const page = Object.values(infoRes.query.pages)[0];
    if (page?.original?.source) {
      const imgRes = await fetch(page.original.source);
      const buff = Buffer.from(await imgRes.arrayBuffer());
      return buff;
    }

    throw new Error("No image found in fallback");
  } catch (err) {
    console.error("[Image Error]", err.message);
    return null; // posts without image
  }
}
