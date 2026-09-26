"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function WorkerDashboardPage() {
  const { phone } = useParams() as { phone: string };
  const [jobs, setJobs] = useState<any[]>([]);
  const [workerName, setWorkerName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboard();
  }, [phone]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/worker-dashboard/${phone}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setWorkerName(data.workerName);
      } else {
        router.push("/worker-dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">Jeebika</h1>
          <span className="text-gray-600">Welcome, {workerName}!</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Recommended Jobs</h2>
        <p className="text-gray-500 mb-4">Jobs sorted by distance, wage, and urgency</p>

        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No jobs available near you</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{job.wage}/day</p>
                    {job.distanceKm && (
                      <p className="text-gray-500 text-sm">{job.distanceKm} km away</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Date</p><p>{job.date}</p></div>
                  <div><p className="text-gray-500">Workers Needed</p><p>{job.workersCount}</p></div>
                  <div><p className="text-gray-500">Match Score</p><p className="font-semibold text-blue-600">{Math.round(job.finalScore * 100)}%</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
