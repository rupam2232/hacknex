"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"worker" | "employer">("employer");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !phone || phone.length < 10) {
      setError("Please fill in all fields correctly");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
        setMessage("OTP sent! Check your phone.");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, role }),
        });
        const registerData = await registerRes.json();
        if (registerData.success) {
          router.push("/dashboard");
        } else {
          setError(registerData.error || "Registration failed");
          setLoading(false);
        }
      } else {
        setError(data.error || "Invalid OTP");
        setLoading(false);
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {step === "form" ? (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-600 mb-4 text-center">Enter your details to get started</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              required
              className="w-full px-4 py-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "worker" | "employer")}
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="employer">Employer</option>
              <option value="worker">Worker</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <>
            <p className="text-gray-600 mb-4 text-center">Enter the OTP sent to {phone}</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mb-3"
            >
              {loading ? "Verifying..." : "Verify & Sign Up"}
            </button>
            <button
              onClick={() => { setStep("form"); setOtp(""); }}
              className="w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Change details
            </button>
          </>
        )}

        {error && <p className="mt-3 text-red-500 text-center text-sm">{error}</p>}
        {message && <p className="mt-3 text-green-600 text-center text-sm">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
