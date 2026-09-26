import Twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }
  return Twilio(accountSid, authToken);
}

export async function sendOTP(phone: string): Promise<{ success: boolean; status?: string; error?: string }> {
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!verifyServiceSid) {
    return { success: false, error: "TWILIO_VERIFY_SERVICE_SID not configured" };
  }

  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required" };
  }

  try {
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: phone, channel: "sms" });
    return { success: true, status: verification.status };
  } catch (error: any) {
    console.error("Twilio sendOTP error:", error.message);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

export async function verifyOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!verifyServiceSid) {
    return { success: false, error: "TWILIO_VERIFY_SERVICE_SID not configured" };
  }

  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required" };
  }

  try {
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
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
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!phoneNumber) {
    console.warn("TWILIO_PHONE_NUMBER not set, skipping SMS:", body);
    return;
  }

  const client = getTwilioClient();
  if (!client) {
    console.warn("TWILIO credentials not set, skipping SMS:", body);
    return;
  }

  try {
    await client.messages.create({
      body,
      from: phoneNumber,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error: any) {
    console.error("SMS send error:", error.message);
  }
}

