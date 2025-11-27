// fetchImage.js
// Safe, stable Wikipedia image fetcher
// Always returns: Buffer OR null

import axios from "axios";

export async function fetchEventImage(event) {
  try {
    // Use the first 8–10 words of the event description as a search query
    const query = event.description.split(" ").slice(0, 10).join(" ");

    console.log("[Image] Searching Wikipedia for:", query);

    // 1. Search Wikipedia
    const searchRes = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "query",
          list: "search",
          srsearch: query,
          format: "json",
          srlimit: 1,
          origin: "*",
        },
      }
    );

    const page = searchRes.data?.query?.search?.[0];
    if (!page) {
      console.log("[Image] No matching Wikipedia page.");
      return null;
    }

    const pageId = page.pageid;

    // 2. Get page info + thumbnail
    const pageInfoRes = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "query",
          pageids: pageId,
          prop: "pageimages",
          pithumbsize: 800,
          format: "json",
          origin: "*",
        },
      }
    );

    const pageInfo = pageInfoRes.data?.query?.pages?.[pageId];

    if (!pageInfo?.thumbnail?.source) {
      console.log("[Image] No thumbnail available.");
      return null;
    }

    const imageUrl = pageInfo.thumbnail.source;
    console.log("[Image] Thumbnail URL:", imageUrl);

    // 3. Download the image
    const imgRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    return Buffer.from(imgRes.data);

  } catch (err) {
    console.error("[Image ERROR]", err.message);
    return null; // fail safe
  }
}
