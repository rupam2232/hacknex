import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { verifyToken, getTokenFromCookies } from "@/lib/jwt";
import geocodeAddress from "@/lib/geocode";

async function getAuthUser(req: NextRequest): Promise<{ phone: string; role: string } | null> {
  const cookies = req.headers.get("cookie") || undefined;
  const token = getTokenFromCookies(cookies);
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { title, workersCount, date, startTime, duration, wage, description, location } = await req.json();

    if (!title || !workersCount || !date || !startTime || !duration || !wage || !description || !location) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const geo = await geocodeAddress(location);

    const jobData: any = {
      employerPhone: user.phone,
      title,
      workersCount,
      date,
      startTime,
      duration,
      wage,
      description,
      location,
    };

    if (geo) {
      jobData.coordinates = { type: "Point", coordinates: [geo.lon, geo.lat] };
    }

    const newJob = new Job(jobData);
    await newJob.save();

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const jobs = await Job.find({ employerPhone: user.phone }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
