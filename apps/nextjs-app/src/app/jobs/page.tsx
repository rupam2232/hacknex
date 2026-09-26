"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700"> Rojgaar</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Home</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">All Posted Jobs</h2>

        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No jobs posted yet</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.location}</p>
                    <p className="text-gray-500 text-sm mt-2">Employer: {job.employerPhone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${job.status === "Open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                    {job.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500">Workers</p><p>{job.workersCount}</p></div>
                  <div><p className="text-gray-500">Wage</p><p>₹{job.wage}/day</p></div>
                  <div><p className="text-gray-500">Date</p><p>{job.date}</p></div>
                  <div><p className="text-gray-500">Duration</p><p>{job.duration}</p></div>
                </div>
                <Link href={`/applications/${job._id}`} className="mt-4 inline-block text-blue-600 hover:underline">
                  View Applicants →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
