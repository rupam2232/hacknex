import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { sendSMS } from "@/lib/twilio";

// Accept or reject an application
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    const { status } = await req.json();
    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const app = await Application.findByIdAndUpdate(id, { status }, { new: true }).populate("jobId");
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const jobTitle = (app.jobId as any).title || "Unknown Job";
    const msg = status === "accepted"
      ? `[Jeebika] Congratulations! Your application for '${jobTitle}' has been ACCEPTED.`
      : `[Jeebika] Your application for '${jobTitle}' has been declined. Keep looking!`;
    await sendSMS(app.workerPhone, msg);

    return NextResponse.json({ success: true, application: app });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
