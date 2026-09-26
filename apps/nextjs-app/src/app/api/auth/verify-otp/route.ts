import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const result = await verifyOTP(phone, otp);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
