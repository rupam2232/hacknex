import { llm } from "@livekit/agents";
import { z } from "zod";
import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";

const ApplyJobSchema = z.object({
  jobId: z.string().describe("The MongoDB job ID to apply for"),
  workerName: z.string().describe("Full name of the worker applying"),
  workerPhone: z.string().describe("Phone number of the worker"),
});

async function applyJobTool(jobId: string, workerName: string, workerPhone: string): Promise<string> {
  const job = await Job.findById(jobId);
  if (!job) {
    return JSON.stringify({ message: "Job not found. Please check the job ID and try again." });
  }

  if (job.status !== "active") {
    return JSON.stringify({ message: "This job is no longer active." });
  }

  const application = await Application.create({
    jobId: job._id,
    workerName,
    workerPhone,
    skill: job.skill,
    status: "pending",
  });

  return JSON.stringify({
    message: `Application submitted successfully! Job: ${job.title} at ${job.area}, ${job.region}. Daily wage: ₹${job.dailyWage}/day. Contractor: ${job.contractorName} (${job.contractorPhone}). You will be contacted soon.`,
    applicationId: application._id,
    status: "pending",
  });
}

export const applyJob = llm.tool({
  name: "applyJob",
  description: "Apply for a specific job. The jobId must come from the jobIds returned by the searchJobs tool.",
  parameters: ApplyJobSchema,
  execute: async ({ jobId, workerName, workerPhone }: { jobId: string; workerName: string; workerPhone: string }) => {
    return await applyJobTool(jobId, workerName, workerPhone);
  },
});
