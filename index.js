import cron from "node-cron";
import dotenv from "dotenv";
import { postDailyTweet } from "./daily.js";
import { postEveningFact } from "./evening.js";
import { postWeeklyThread } from "./weekly.js";

dotenv.config();

function requireEnv(name) {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

// Ensure required credentials exist
["API_KEY", "API_SECRET", "ACCESS_TOKEN", "ACCESS_SECRET", "OPENAI_KEY"].forEach(requireEnv);

console.log("[DateToday] Bot starting…");

// Basic global error logging
process.on("unhandledRejection", (reason) => {
  console.error("[UnhandledRejection]", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[UncaughtException]", err);
});

// Cron expressions are evaluated in UTC by default.
// 09:00 UTC - main On This Day tweet
cron.schedule("0 9 * * *", async () => {
  console.log("[Cron] Running daily On This Day job (09:00 UTC)");
  await postDailyTweet();
}, { timezone: "UTC" });

// 18:00 UTC - evening extra fact
cron.schedule("0 18 * * *", async () => {
  console.log("[Cron] Running evening fact job (18:00 UTC)");
  await postEveningFact();
}, { timezone: "UTC" });

// Sunday 16:00 UTC - weekly deep dive thread
cron.schedule("0 16 * * 0", async () => {
  console.log("[Cron] Running weekly thread job (Sunday 16:00 UTC)");
  await postWeeklyThread();
}, { timezone: "UTC" });

console.log("[DateToday] Schedules registered. Bot is now waiting for cron triggers.");
