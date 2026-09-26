import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { Application } from "@/lib/models/Application";
import { sendSMS } from "@/lib/twilio";
import { twiml } from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
}

// GET endpoint for verification
export async function GET() {
  return NextResponse.json({ success: true, message: "SMS reply webhook is reachable!" });
}

// POST endpoint for incoming SMS (Twilio webhook)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    const fromPhone = params.get("From");
    const text = params.get("Body")?.trim() || "";

    const twimlResponse = new twiml.MessagingResponse();

    if (!fromPhone) {
      twimlResponse.message("Error: Could not identify your phone number.");
      return new Response(twimlResponse.toString(), { headers: { "Content-Type": "text/xml" } });
    }

    await connectDB();

    const employerJobs = await Job.find({ employerPhone: fromPhone }).select("_id title");
    if (employerJobs.length === 0) {
      twimlResponse.message("No jobs found for your phone number.");
      return new Response(twimlResponse.toString(), { headers: { "Content-Type": "text/xml" } });
    }

    const jobIds = employerJobs.map((j: any) => j._id);
    const latestApp = await Application.findOne({
      jobId: { $in: jobIds },
      status: "pending",
    }).sort({ createdAt: -1 }).populate("jobId");

    if (!latestApp) {
      twimlResponse.message("No pending applications found to respond to.");
      return new Response(twimlResponse.toString(), { headers: { "Content-Type": "text/xml" } });
    }

    const jobTitle = (latestApp.jobId as any).title || "Unknown Job";
    if (text === "0") {
      latestApp.status = "accepted";
      await latestApp.save();
      await sendSMS(latestApp.workerPhone, `[Jeebika] Your application for '${jobTitle}' has been ACCEPTED.`);
      twimlResponse.message(`You have ACCEPTED ${latestApp.workerName}'s application for '${jobTitle}'.`);
    } else if (text === "1") {
      latestApp.status = "rejected";
      await latestApp.save();
      await sendSMS(latestApp.workerPhone, `[Jeebika] Your application for '${jobTitle}' has been declined.`);
      twimlResponse.message(`You have REJECTED ${latestApp.workerName}'s application for '${jobTitle}'.`);
    } else {
      twimlResponse.message(`Invalid response "${text}". Reply exactly 0 to ACCEPT or 1 to REJECT.`);
    }

    return new Response(twimlResponse.toString(), { headers: { "Content-Type": "text/xml" } });
  } catch (err: any) {
    console.error("SMS Reply Error:", err);
    const twimlResponse = new twiml.MessagingResponse();
    twimlResponse.message("An error occurred processing your request.");
    return new Response(twimlResponse.toString(), { headers: { "Content-Type": "text/xml" } });
  }
}
