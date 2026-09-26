import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { verifyToken, getTokenFromCookies } from "@/lib/jwt";
import geocodeAddress from "@/lib/geocode";

async function getAuthUser(req: NextRequest): Promise<{ phone: string; name?: string; role: string } | null> {
  const cookies = req.headers.get("cookie") || undefined;
  const token = getTokenFromCookies(cookies);
  if (!token) return null;
  return verifyToken(token) as any;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const { title, skill, region, area, aliases, dailyWage, contractorName, contractorPhone, status, locationCoordinates } = body;

    const finalContractorName = contractorName || user.name || "Employer";
    const finalContractorPhone = contractorPhone || user.phone;

    if (!title || !skill || !region || !area || !dailyWage) {
      return NextResponse.json({ error: "Title, skill, region, area, and dailyWage are required" }, { status: 400 });
    }

    let geo = await geocodeAddress(`${area}, ${region}`);
    if (!geo) {
      geo = await geocodeAddress(area);
    }
    if (!geo) {
      geo = await geocodeAddress(region);
    }

    let finalCoordinates: [number, number];
    if (geo) {
      finalCoordinates = [geo.lon, geo.lat];
    } else if (locationCoordinates?.coordinates && Array.isArray(locationCoordinates.coordinates) && locationCoordinates.coordinates.length === 2) {
      finalCoordinates = locationCoordinates.coordinates;
    } else {
      return NextResponse.json(
        { error: `Could not dynamically geocode location for Area: '${area}', Region: '${region}'. Please verify the spelling.` },
        { status: 400 }
      );
    }

    const formattedAliases = Array.isArray(aliases)
      ? aliases
      : typeof aliases === "string"
        ? aliases.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    const newJob = new Job({
      title,
      skill: skill.toLowerCase(),
      region,
      area,
      aliases: formattedAliases,
      dailyWage: Number(dailyWage),
      contractorName: finalContractorName,
      contractorPhone: finalContractorPhone,
      status: status || "active",
      locationCoordinates: {
        type: "Point",
        coordinates: finalCoordinates,
      },
    });

    await newJob.save();

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const phoneClean = user.phone.replace(/^\+91/, "").trim();
    let jobs = await Job.find({
      $or: [
        { contractorPhone: user.phone },
        { contractorPhone: phoneClean },
        { contractorPhone: `+91${phoneClean}` },
        { employerPhone: user.phone },
      ],
    }).sort({ createdAt: -1 });

    // Fallback: If no personal jobs found, display active platform / seeded jobs
    if (jobs.length === 0) {
      jobs = await Job.find({ status: "active" }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}


