import Link from "next/link";

export default function Navbar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-700">Jeebika</Link>
        <div className="flex gap-4 items-center">
          {children}
        </div>
      </div>
    </nav>
  );
}
