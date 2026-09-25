import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from "@livekit/agents";
import { ParticipantKind } from "@livekit/rtc-node";
import * as google from "@livekit/agents-plugin-google";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { searchJobs, getWorker, saveWorker } from "./tools/jobTools.js";
import { applyJob } from "./tools/applyJob.js";
import { systemPrompt } from "./prompts/systemPrompt.js";
import { Worker } from "./models/Worker.js";

dotenv.config();

const agent = voice.Agent.create({
  instructions: systemPrompt,
  tools: [searchJobs, applyJob, getWorker, saveWorker],
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
    const participant = await ctx.waitForParticipant()

    let phone = ctx.info.acceptArguments?.identity;

    if (participant.kind === ParticipantKind.SIP) {
      phone = participant.attributes['sip.phoneNumber'];
    }

    let contextMessage = "";
    console.log("Caller phone number:", phone);
    if (phone) {
      try {
        const existingWorker = await Worker.findOne({ phone });
        if (existingWorker) {
          contextMessage = `The caller's phone number is ${phone}. They are a returning worker named ${existingWorker.name}. Their skill is ${existingWorker.skill} and preferred location is ${existingWorker.location}. Welcome them by name.`;
        } else {
          contextMessage = `The caller's phone number is ${phone}. They have not registered yet. Greet them and ask for their name and skill so you can save their profile.`;
        }
      } catch {
        contextMessage = `The caller's phone number is ${phone}. They have not registered yet. Greet them and ask for their name and skill so you can save their profile.`;
      }
    } else {
      contextMessage = "The caller's phone number was not available. Greet them and ask for their phone number, name, and skill so you can save their profile.";
    }

    session.generateReply({
      instructions: `${contextMessage} ${systemPrompt}`,
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
