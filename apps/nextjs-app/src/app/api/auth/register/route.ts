import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { phone, name, role } = await req.json();
    if (!phone || !name || !role) {
      return NextResponse.json({ error: "Phone, name, and role are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this phone number" }, { status: 400 });
    }

    const newUser = new User({ phone, name, role });
    await newUser.save();

    const token = generateToken(phone, name, role);

    return NextResponse.json(
      { success: true, user: { phone, name, role } },
      {
        headers: {
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`,
        },
      }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
