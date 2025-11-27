# DateToday Bot (Advanced)

Automated X (Twitter) bot that:
- posts a daily “On this day” history tweet at 09:00 UTC
- posts an extra historical fact at 18:00 UTC
- posts a weekly deep-dive thread every Sunday at 16:00 UTC

## Environment variables

Set these in Railway (Service → Variables):

- API_KEY: X API key
- API_SECRET: X API secret
- ACCESS_TOKEN: X access token
- ACCESS_SECRET: X access secret
- OPENAI_KEY: OpenAI API key

## Run locally (optional)

1. Create a `.env` file:

   API_KEY=...
   API_SECRET=...
   ACCESS_TOKEN=...
   ACCESS_SECRET=...
   OPENAI_KEY=...

2. Install dependencies:

   npm install

3. Start the bot:

   npm start

Cron schedules use UTC by default.
Adjust them in `index.js` if you want different times or time zones.
