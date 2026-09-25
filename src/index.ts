import { defineAgent, voice, cli, VAD, type JobContext, inference } from "@livekit/agents";
import { ServerOptions } from "@livekit/agents";
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

export default defineAgent({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    console.log("🟢 Call accepted, initializing...");

    await connectDB();

    const vad = ctx.proc.userData.vad || (await silero.VAD.load());

    const agent = voice.Agent.create({
      instructions: systemPrompt,
      tools: [searchJobs],
    });

    const session = new voice.AgentSession({
      llm: new google.LLM({
        model: "gemini-2.5-flash",
        apiKey: process.env.GOOGLE_API_KEY,
      }),
      stt: new deepgram.STT({
        model: "nova-3",
        language: "en",
        apiKey: process.env.DEEPGRAM_API_KEY,
      }),
      tts: new elevenlabs.TTS({
        model: "eleven_multilingual_v2",
        voiceId: process.env.ELEVENLABS_VOICE_ID,
        apiKey: process.env.ELEVEN_API_KEY,
      }),
      // turnHandling: {
      //   turnDetection: new inference.TurnDetector(),
      // },
      vad: vad as VAD,
      expressive: true,
    });

    await session.start({
      agent: agent,
      room: ctx.room,
    });

    await ctx.connect()

    // await session.say(
    //   "Hello! Welcome to Kormo Shathi. Are you looking for a job?",
    //   { allowInterruptions: true }
    // );
    const handle = session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "kormo-shathi",
    // initializeProcessTimeout: 30000,
  })
);


// import {
//   type JobContext,
//   ServerOptions,
//   cli,
//   defineAgent,
//   inference,
//   voice,
//   type VAD
// } from '@livekit/agents';
// import * as aiCoustics from '@livekit/plugins-ai-coustics';
// import { fileURLToPath } from 'node:url';
// import dotenv from 'dotenv';
// import { createAgent } from './agent';

// dotenv.config();

// export default defineAgent({
//   entry: async (ctx: JobContext) => {
    
//     const vad = ctx.proc.userData.vad || (await silero.VAD.load());

//     const session = new voice.AgentSession({
//       llm: new google.LLM({
//         model: "gemini-3.6-flash",
//         apiKey: process.env.GOOGLE_API_KEY,
//       }),
//       stt: new deepgram.STT({
//         model: "nova-3",
//         language: "en",
//         apiKey: process.env.DEEPGRAM_API_KEY,
//       }),
//       tts: new elevenlabs.TTS({
//         model: "eleven_multilingual_v2",
//         voiceId: process.env.ELEVENLABS_VOICE_ID,
//         apiKey: process.env.ELEVEN_API_KEY,
//       }),
//       vad: vad as VAD,

//       // stt: new inference.STT({ model: 'assemblyai/universal-3-5-pro', language: 'en' }),
//       // llm: new inference.LLM({ model: 'google/gemma-4-31b-it' }),
//       // tts: new inference.TTS({
//       //   model: 'fishaudio/s2.1-pro',
//       //   voice: 'fa4c9eb3dccc4806b382b40d61c6b10a',
//       // }),
//       turnHandling: {
//         turnDetection: new inference.TurnDetector(),
//       },
//     });

//     await session.start({
//       agent: createAgent(),
//       room: ctx.room,
//       inputOptions: {
//         noiseCancellation: aiCoustics.audioEnhancement({ model: aiCoustics.EnhancerModel.QuailVfS }),
//       },
//     });

//     await ctx.connect();

//     const handle = session.generateReply({
//       instructions: 'Greet the user and offer your assistance.',
//     });
//   },
// });

// cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url), agentName: 'my-agent' }));