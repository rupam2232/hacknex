import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { verifyToken, getTokenFromCookies } from "@/lib/jwt";

async function getAuthUser(req: NextRequest): Promise<{ phone: string; role: string } | null> {
  const cookies = req.headers.get("cookie") || undefined;
  const token = getTokenFromCookies(cookies);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.employerPhone !== user.phone) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user || user.role !== "employer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const job = await Job.findByIdAndDelete(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
