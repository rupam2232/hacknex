import { llm } from "@livekit/agents";
import { z } from "zod";
import { Job } from "../models/Job.js";

const JobSchema = z.object({
  skill: z.string().describe("Trade or skill, e.g. painter, carpenter, mason, electrician, plumber"),
  location: z.string().describe("Location, neighborhood, or landmark mentioned by user, e.g. Kalyani, Salt Lake, AIIMS, Kanchrapara, Dum Dum")
});

async function searchJobsTool(skill: string, location: string): Promise<string> {
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
    return JSON.stringify({ message: "No direct matches found in this exact locality. Suggest looking in nearby areas or checking back tomorrow." });
  }

  const formatted = results.map(
    (j: { title: string; area: string; dailyWage: number; contractorName: string; contractorPhone: string }) =>
      `${j.title} — ${j.area} — ₹${j.dailyWage}/day — Contractor: ${j.contractorName}, Phone: ${j.contractorPhone}`
  );

  return formatted.join("\n");
}

export const searchJobs = llm.tool({
  name: "searchJobs",
  description: "Search active daily-wage jobs based on trade or skill and location.",
  parameters: JobSchema,
  execute: async ({ skill, location }: { skill: string; location: string }) => {
    return await searchJobsTool(skill, location);
  }
});
