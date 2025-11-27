import axios from "axios";
import { classifyEvent } from "./eventClassifier.js";

export async function getEventForDate(date = new Date()) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;
  console.log("[Events] Fetching events from:", url);

  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const events = data.events;

    if (!events || events.length === 0) {
      throw new Error("No events returned");
    }

    // STEP 1 — Filter to educational events
    const educationalEvents = events.filter(e => {
      const desc = e.description.toLowerCase();

      // Filter OUT trivial/modern/pop events
      const excluded = ["film", "movie", "album", "sport", "football", "soccer", "pop", "award", "tv", "show", "team"];
      if (excluded.some(k => desc.includes(k))) return false;

      // Must be related to history, science, culture, politics, exploration, religion, art, etc.
      const included = [
        "war", "battle", "empire", "king", "queen", "emperor",
        "dynasty", "revolution", "invention", "discovery", "science",
        "medicine", "astronomy", "philosophy", "religion",
        "treaty", "constitution", "rights", "independence",
        "exploration", "expedition", "architecture", "art", "culture",
        "society", "reform", "civil", "navy", "army", "astronomer"
      ];
      return included.some(k => desc.includes(k));
    });

    const pool = educationalEvents.length > 0 ? educationalEvents : events;

    // STEP 2 — Score events
    const scored = pool.map(ev => ({
      event: ev,
      score: classifyEvent(ev.description)
    }));

    // STEP 3 — Weighted random selection
    const weighted = [];
    for (const item of scored) {
      for (let i = 0; i < item.score; i++) weighted.push(item.event);
    }

    const finalEvent = weighted[Math.floor(Math.random() * weighted.length)];

    // Extract Wikipedia title
    const wiki = finalEvent.wikipedia?.[0];
    const wikipediaTitle = wiki?.title || null;

    return {
      year: finalEvent.year,
      description: finalEvent.description,
      wikipediaTitle
    };
  } catch (err) {
    console.error("[Events] Error:", err);
    return {
      year: "N/A",
      description: "A major historical event took place on this day, shaping human development.",
      wikipediaTitle: null
    };
  }
}
