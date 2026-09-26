"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateJobPage() {
  const [form, setForm] = useState({
    title: "",
    skill: "painter",
    region: "",
    area: "",
    aliases: "",
    dailyWage: "",
    contractorName: "",
    contractorPhone: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch user info to auto-fill contractor details
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setForm((prev) => ({
            ...prev,
            contractorName: prev.contractorName || data.user.name || "",
            contractorPhone: prev.contractorPhone || data.user.phone || "",
          }));
        }
      })
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          skill: form.skill.toLowerCase(),
          region: form.region,
          area: form.area,
          aliases: form.aliases ? form.aliases.split(",").map((s) => s.trim()).filter(Boolean) : [],
          dailyWage: parseFloat(form.dailyWage),
          contractorName: form.contractorName,
          contractorPhone: form.contractorPhone,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Job posted successfully!");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setError(data.error || "Failed to create job");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-700">Rojgaar</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
              Employer Portal
            </span>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 font-medium hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill in job requirement details for workers and LiveKit voice agent matching.
          </p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
        {message && <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5 border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="e.g., Need 2 House Painters for 3 Days"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Required Skill / Profession <span className="text-red-500">*</span>
              </label>
              <select
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="painter">Painter</option>
                <option value="carpenter">Carpenter</option>
                <option value="mason">Mason</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Daily Wage (₹ per day) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.dailyWage}
                onChange={(e) => setForm({ ...form, dailyWage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="e.g., 800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Region / City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="e.g., Kolkata or West Bengal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Area / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                placeholder="e.g., Salt Lake Sector V"
              />
            </div>
          </div>



          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Aliases / Search Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.aliases}
              onChange={(e) => setForm({ ...form, aliases: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="similar place releted to location"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-md transition"
          >
            {loading ? "Posting Job..." : "Publish Job Post"}
          </button>
        </form>
      </main>
    </div>
  );
}

