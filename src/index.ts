import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  voice,
  type VAD,
  inference,
} from "@livekit/agents";
import * as silero from "@livekit/agents-plugin-silero";
import * as google from "@livekit/agents-plugin-google";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as elevenlabs from "@livekit/agents-plugin-elevenlabs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { searchJobs } from "./tools/jobTools.js";
import { systemPrompt } from "./prompts/systemPrompt.js";

dotenv.config();

const agent = voice.Agent.create({
  instructions: systemPrompt,
  tools: [searchJobs],
});

await connectDB().catch((error: Error) => {
  console.log(error.message);
  process.exit(1);
});

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("🟢 Call accepted, initializing...");

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: "gemini-3.1-flash-live-preview",
        voice: "Puck",
        instructions: "You are a helpful assistant",
      }),
    });

    await session.start({
      agent: agent,
      room: ctx.room,
    });

    await ctx.connect();

    session.generateReply({
      instructions: "Greet the user and offer your assistance.",
      allowInterruptions: true,
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "rojgaar",
    initializeProcessTimeout: 30000,
  }),
);
