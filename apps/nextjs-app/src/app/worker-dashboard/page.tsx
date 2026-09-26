"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkerDashboardLanding() {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      router.push(`/worker-dashboard/${phone}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Worker Dashboard</h1>
        <p className="text-center opacity-80 mb-6">Enter your phone number to view recommended jobs</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="w-full px-4 py-3 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-gray-100"
          >
            View Jobs
          </button>
        </form>
      </div>
    </div>
  );
}
