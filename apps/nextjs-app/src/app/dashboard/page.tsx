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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/login");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 font-medium">Loading Dashboard...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-700">Rojgaar</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
              Employer Dashboard
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Hello, {user?.name}</span>
            <Link
              href="/create-job"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition"
            >
              + Post New Job
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Posted Jobs</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage job listings and track applicants in real time</p>
          </div>
          <span className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
            Total Jobs: {jobs.length}
          </span>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        {jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">No job postings found yet.</p>
            <Link href="/create-job" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Create First Job Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-md tracking-wider mb-1">
                        {job.skill || "General"}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${job.status === "active" || job.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {job.status || "active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4 bg-gray-50 p-3.5 rounded-lg border border-gray-100 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Daily Wage</span>
                      <span className="font-bold text-gray-900 text-base">₹{job.dailyWage || job.wage || 0}/day</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Location / Area</span>
                      <span className="font-semibold text-gray-800">{job.area || job.location}, {job.region}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Contractor Name</span>
                      <span className="font-medium text-gray-800">{job.contractorName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Phone</span>
                      <span className="font-medium text-gray-800">{job.contractorPhone || job.employerPhone}</span>
                    </div>
                  </div>

                  {job.aliases && job.aliases.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs text-gray-400 block mb-1">Tags / Aliases:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.aliases.map((alias: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            #{alias}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <Link href={`/applications/${job._id}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline">
                    View Applicants →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

