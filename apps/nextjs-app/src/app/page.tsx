import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">Rojgaar</h1>
        <p className="text-xl mb-8 opacity-80">
          Connecting employers with skilled workers for daily-wage jobs
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-blue-900 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Employer Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-transparent border-2 border-white rounded-full font-semibold hover:bg-white/10 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
