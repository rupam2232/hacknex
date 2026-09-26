import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const result = await sendOTP(phone);
    if (result.success) {
      return NextResponse.json({ success: true, status: result.status });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("send-otp error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
