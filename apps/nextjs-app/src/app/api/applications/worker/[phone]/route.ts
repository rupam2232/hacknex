import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Application } from "@/lib/models/Application";

// Get worker's own applications
export async function GET(req: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  try {
    await connectDB();
    const applications = await Application.find({ workerPhone: phone })
      .populate("jobId")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
