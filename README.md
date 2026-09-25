# Kormo Shathi (কর্ম সাথী) — Bengali Voice Agent

Real-time conversational voice agent for Indian daily-wage workers, built with LiveKit, Google Gemini 1.5 Flash, ElevenLabs, and MongoDB.

## Terminal Commands

### 1. Start Docker MongoDB
```bash
docker compose up -d
```

### 2. Run the Seed Script
```bash
npm run seed
```

### 3. Launch the LiveKit Voice Agent
```bash
npm run dev
# or
npm start
```

## Setup Steps

1. Copy `.env.example` to `.env` and fill in your API keys.
2. Start Docker: `docker compose up -d`
3. Seed the database: `npm run seed`
4. Start the agent: `npm run dev`
