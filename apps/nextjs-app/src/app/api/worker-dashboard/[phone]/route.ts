import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import { sendSMS } from "@/lib/twilio";

// Worker dashboard — geospatial scoring
export async function GET(req: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  try {
    await connectDB();

    const worker = await User.findOne({ phone, role: "worker" });
    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    const workerLat = parseFloat(worker.location?.lat || "NaN");
    const workerLon = parseFloat(worker.location?.lon || "NaN");
    const hasGeo = !isNaN(workerLat) && !isNaN(workerLon);

    let scoredJobs;

    if (hasGeo) {
      const MAX_DISTANCE_METERS = 50 * 1000;
      const nearbyJobs = await Job.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [workerLon, workerLat] },
            distanceField: "distanceMeters",
            maxDistance: MAX_DISTANCE_METERS,
            spherical: true,
            query: { status: "Open" },
          },
        },
      ]);

      scoredJobs = nearbyJobs.map((job: any) => {
        const distanceKm = job.distanceMeters / 1000;
        const distanceScore = Math.max(0, 1 - distanceKm / 50);
        const wageScore = Math.min(job.wage / 1000, 1);
        const daysUntilJob = (new Date(job.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        const urgencyScore = daysUntilJob <= 3 ? 1 : Math.max(0, 1 - daysUntilJob / 30);
        const finalScore = distanceScore * 0.5 + wageScore * 0.3 + urgencyScore * 0.2;
        return { ...job, distanceKm: parseFloat(distanceKm.toFixed(2)), finalScore };
      });
    } else {
      const allJobs = await Job.find({ status: "Open" }).sort({ createdAt: -1 }).limit(50);
      scoredJobs = allJobs.map((job: any) => {
        const daysUntilJob = (new Date(job.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        const urgencyScore = daysUntilJob <= 3 ? 1 : Math.max(0, 1 - daysUntilJob / 30);
        const wageScore = Math.min(job.wage / 1000, 1);
        const finalScore = wageScore * 0.6 + urgencyScore * 0.4;
        return { ...job._doc, distanceKm: null, finalScore };
      });
    }

    scoredJobs.sort((a: any, b: any) => b.finalScore - a.finalScore);
    return NextResponse.json({ success: true, jobs: scoredJobs, workerName: worker.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
