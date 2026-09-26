"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; role: string; phone: string } | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchJobs();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.success) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    } catch {
      router.push("/login");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = "token=; Path=/; HttpOnly; Max-Age=0";
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">Jeebika</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <Link href="/create-job" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Post Job
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Your Posted Jobs</h2>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No jobs posted yet</p>
            <Link href="/create-job" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    job.status === "Open" ? "bg-green-100 text-green-800" :
                    job.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Workers Needed</p>
                    <p className="font-semibold">{job.workersCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Wage</p>
                    <p className="font-semibold">₹{job.wage}/day</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-semibold">{job.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold">{job.duration}</p>
                  </div>
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
