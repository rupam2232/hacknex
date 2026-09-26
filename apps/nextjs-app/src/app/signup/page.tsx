"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!name.trim() || !phone || phone.length < 10) {
      setError("Please enter a valid full name and phone number");
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
        setMessage("OTP sent via SMS! Please check your mobile phone.");
      } else {
        setError(data.error || "Failed to send OTP. Check Twilio settings.");
      }
    } catch {
      setError("Network error. Please try again.");
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
        // Now register user as Employer (passwordless)
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, role: "employer" }),
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
      setError("Network error during verification.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-2">
            Employer Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Employer Sign Up</h1>
          <p className="text-sm text-gray-500 mt-1">Passwordless authentication via SMS OTP</p>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employer / Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe or Acme Construction"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-gray-600 mb-4 text-center text-sm">
              Enter the 6-digit OTP code sent to <span className="font-semibold text-gray-900">{phone}</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length < 4}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mb-3 transition"
            >
              {loading ? "Verifying..." : "Verify & Sign Up"}
            </button>
            <button
              onClick={() => { setStep("form"); setOtp(""); setError(""); setMessage(""); }}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Edit phone details
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-red-500 text-center text-sm font-medium">{error}</p>}
        {message && <p className="mt-3 text-green-600 text-center text-sm font-medium">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an employer account?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

