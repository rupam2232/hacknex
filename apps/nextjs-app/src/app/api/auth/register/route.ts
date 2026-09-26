import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";

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

    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        phone,
        name,
        role,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
