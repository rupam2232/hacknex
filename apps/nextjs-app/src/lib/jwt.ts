import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export function generateToken(phone: string, name: string, role: string): string {
  return jwt.sign(
    { phone, name, role, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): { phone: string; name: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { phone: string; name: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(cookies: string | undefined): string | null {
  if (!cookies) return null;
  const match = cookies.match(/token=([^;]+)/);
  return match ? match[1] : null;
}
