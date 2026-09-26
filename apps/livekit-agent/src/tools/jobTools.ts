import { llm } from "@livekit/agents";
import { z } from "zod";
import { Job } from "../models/Job.js";
import { Worker } from "../models/Worker.js";

const JobSchema = z.object({
  skill: z.string().describe("Trade or skill, e.g. painter, carpenter, mason, electrician, plumber"),
  location: z.string().describe("Location, neighborhood, or landmark mentioned by user, e.g. Kalyani, Salt Lake, AIIMS, Kanchrapara, Dum Dum")
});

const GetWorkerSchema = z.object({
  phone: z.string().describe("The phone number of the worker to look up"),
});

const SaveWorkerSchema = z.object({
  name: z.string().describe("Full name of the worker"),
  phone: z.string().describe("Phone number of the worker"),
  skill: z.string().describe("Trade or skill, e.g. painter, carpenter, mason, electrician, plumber"),
  location: z.string().describe("Preferred location or neighborhood"),
});

async function searchJobsTool(skill: string, location: string): Promise<{ results: string; jobIds: string[] }> {
  const results = await Job.find({
    status: "active",
    skill: { $regex: skill, $options: "i" },
    $or: [
      { region: { $regex: location, $options: "i" } },
      { area: { $regex: location, $options: "i" } },
      { aliases: { $regex: location, $options: "i" } }
    ]
  })
    .limit(2)
    .lean();

  if (!results || results.length === 0) {
    return { results: "No direct matches found in this exact locality. Suggest looking in nearby areas or checking back tomorrow.", jobIds: [] };
  }

  const formatted = results.map(
    (j) =>
      `${j.title} — ${j.area} — ₹${j.dailyWage}/day — Contractor: ${j.contractorName}, Phone: ${j.contractorPhone}`
  );

  const jobIds = results.map((j) => j._id.toString());

  return { results: formatted.join("\n"), jobIds };
}

async function getWorkerTool(phone: string): Promise<string> {
  const worker = await Worker.findOne({ phone });
  if (!worker) {
    return JSON.stringify({ found: false, message: "No worker profile found with this phone number." });
  }
  return JSON.stringify({
    found: true,
    name: worker.name,
    skill: worker.skill,
    location: worker.location,
    callCount: worker.callCount,
    message: `Found worker: ${worker.name}, skill: ${worker.skill}, location: ${worker.location}, called ${worker.callCount} times.`,
  });
}

async function saveWorkerTool(name: string, phone: string, skill: string, location: string): Promise<string> {
  const existing = await Worker.findOne({ phone });
  if (existing) {
    return JSON.stringify({ message: `Worker ${name} already exists with this phone number.` });
  }

  await Worker.create({ name, phone, skill, location });
  return JSON.stringify({ message: `Profile saved for ${name}. Welcome to Kormo Shathi! We'll remember your details for next time.` });
}

export const searchJobs = llm.tool({
  name: "searchJobs",
  description: "Search active daily-wage jobs based on trade or skill and location. Returns results and jobIds for internal use.",
  parameters: JobSchema,
  execute: async ({ skill, location }: { skill: string; location: string }) => {
    return await searchJobsTool(skill, location);
  }
});

export const getWorker = llm.tool({
  name: "getWorker",
  description: "Look up a worker's profile by phone number. Use this to check if a caller has registered before.",
  parameters: GetWorkerSchema,
  execute: async ({ phone }: { phone: string }) => {
    return await getWorkerTool(phone);
  },
});

export const saveWorker = llm.tool({
  name: "saveWorker",
  description: "Save a new worker's profile. Use this when a caller registers for the first time.",
  parameters: SaveWorkerSchema,
  execute: async ({ name, phone, skill, location }: { name: string; phone: string; skill: string; location: string }) => {
    return await saveWorkerTool(name, phone, skill, location);
  },
});
