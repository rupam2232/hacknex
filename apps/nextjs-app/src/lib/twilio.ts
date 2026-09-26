import Twilio from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
}

const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function sendOTP(phone: string): Promise<{ success: boolean; status?: string; error?: string }> {
  if (!TWILIO_VERIFY_SERVICE_SID) {
    return { success: false, error: "TWILIO_VERIFY_SERVICE_SID not configured" };
  }

  try {
    const verification = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: "sms" });
    return { success: true, status: verification.status };
  } catch (error: any) {
    console.error("Twilio sendOTP error:", error.message);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

export async function verifyOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_VERIFY_SERVICE_SID) {
    return { success: false, error: "TWILIO_VERIFY_SERVICE_SID not configured" };
  }

  try {
    const verificationCheck = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({ to: phone, code: otp });

    if (verificationCheck.status === "approved") {
      return { success: true };
    } else {
      return { success: false, error: "Invalid or expired OTP" };
    }
  } catch (error: any) {
    console.error("Twilio verifyOTP error:", error.message);
    return { success: false, error: error.message || "Failed to verify OTP" };
  }
}

export async function sendSMS(to: string, body: string): Promise<void> {
  if (!TWILIO_PHONE_NUMBER) {
    console.warn("TWILIO_PHONE_NUMBER not set, skipping SMS:", body);
    return;
  }

  try {
    await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error: any) {
    console.error("SMS send error:", error.message);
  }
}
