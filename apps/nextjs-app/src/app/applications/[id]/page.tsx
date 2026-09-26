"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ApplicationsPage() {
  const { id } = useParams() as { id: string };
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId: string, action: "accepted" | "rejected") => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch {
      alert("Failed to update application");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-700">Jeebika</h1>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">← Back</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Applications</h2>

        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No applications yet</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <div key={app._id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{app.workerName}</h3>
                  <p className="text-gray-600 text-sm">{app.workerPhone}</p>
                  <p className="text-gray-500 text-sm">Location: {app.workerLocation}</p>
                  <p className="text-gray-500 text-sm">Wage Expected: ₹{app.wageExpectation || "N/A"}/day</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    app.status === "accepted" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {app.status}
                  </span>
                </div>
                {app.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(app._id, "accepted")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(app._id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
