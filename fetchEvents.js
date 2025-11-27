// fetchEvents.js
// Fetches today's historical events from ByAbbe API
// and returns ONE random clean event.

import axios from "axios";

export async function getRandomEvent() {
  try {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;
    console.log("[Events] Fetching events from:", url);

    const res = await axios.get(url);
    const events = res.data?.events || [];

    if (!events.length) {
      throw new Error("No events returned by API");
    }

    // Filter garbage + hyper-specific political entries
    const filtered = events.filter((ev) => {
      const desc = ev.description.toLowerCase();

      return (
        desc.length > 40 &&
        !desc.includes("election") &&
        !desc.includes("football") &&
        !desc.includes("soccer") &&
        !desc.includes("governor") &&
        !desc.includes("premier league")
      );
    });

    const usableEvents = filtered.length ? filtered : events;

    const randomEvent = usableEvents[Math.floor(Math.random() * usableEvents.length)];

    return {
      year: randomEvent.year,
      description: randomEvent.description,
      monthName: date.toLocaleString("en-US", { month: "long" }),
      day,
    };

  } catch (err) {
    console.error("[Events ERROR]", err.message);
    throw err;
  }
}
