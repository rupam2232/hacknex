import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { verifyToken, getTokenFromCookies } from "@/lib/jwt";

async function getAuthUser(req: NextRequest): Promise<{ phone: string; role: string } | null> {
  const cookies = req.headers.get("cookie") || undefined;
  const token = getTokenFromCookies(cookies);
  if (!token) return null;
  return verifyToken(token);
}

// Apply for a job (worker side)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { jobId, workerPhone, workerName, workerLocation, wageExpectation } = await req.json();
    if (!jobId || !workerPhone || !workerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const existing = await Application.findOne({ jobId, workerPhone });
    if (existing) {
      return NextResponse.json({ error: "Already applied for this job" }, { status: 400 });
    }

    const app = new Application({ jobId, workerPhone, workerName, workerLocation, wageExpectation });
    await app.save();

    return NextResponse.json({ success: true, application: app }, { status: 201 });
  } catch (error: any) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}

// Get all applications for this employer's jobs
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const applications = await Application.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
