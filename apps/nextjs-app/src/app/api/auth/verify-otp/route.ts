import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { generateToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const result = await verifyOTP(phone, otp);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Invalid OTP" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ phone });

    if (user) {
      const token = generateToken(user.phone, user.name, user.role);
      return NextResponse.json(
        { success: true, isRegistered: true, user: { phone: user.phone, name: user.name, role: user.role } },
        {
          headers: {
            "Set-Cookie": `token=${token}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`,
          },
        }
      );
    }

    return NextResponse.json({ success: true, isRegistered: false });
  } catch (error: any) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}

