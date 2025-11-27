import axios from "axios";

function pickPreferredEvent(events) {
  if (!events || events.length === 0) {
    return null;
  }

  // Prefer events between years 1500 and 2000 for relatability
  const preferred = events.filter(e => {
    const yearNum = parseInt(e.year, 10);
    return yearNum >= 1500 && yearNum <= 2000;
  });

  const pool = preferred.length ? preferred : events;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export async function getEventForDate(date = new Date()) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;
  console.log("[Events] Fetching events from:", url);

  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const event = pickPreferredEvent(data.events);

    if (!event) {
      throw new Error("No events returned from API");
    }

    const wikipediaEntry = event.wikipedia?.[0];
    const wikipediaTitle = wikipediaEntry?.title || null;

    return {
      year: event.year,
      description: event.description,
      wikipediaTitle
    };
  } catch (err) {
    console.error("[Events] Failed to fetch events:", err.message || err);
    return {
      year: "N/A",
      description: "A significant historical event took place on this day. (Fallback content – external API unavailable.)",
      wikipediaTitle: null
    };
  }
}
