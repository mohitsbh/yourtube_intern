import axios from "axios";
import { sendOtpEmail } from "./sendOtpEmail.js";

/**
 * Sends OTP via Fast2SMS and falls back to email if needed.
 *
 * @param {string} phone - Recipient's mobile number
 * @param {string} otp - One-Time Password
 * @param {string|null} email - Optional fallback email
 */
export const sendOtpSMS = async (phone, otp, email = null) => {
  try {
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
    const debugOtp = process.env.DEBUG_OTP;

    if (!fast2smsApiKey) throw new Error("Fast2SMS API key not set");

    if (debugOtp !== "true" && debugOtp !== "false") {
      throw new Error("DEBUG_OTP must be set to 'true' or 'false' in environment variables.");
    }

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: `Your OTP is ${otp}`,
        language: "english",
        flash: 0,
        numbers: phone,
      },
      {
        headers: {
          authorization: fast2smsApiKey,
        },
      }
    );

    const data = response.data;
    const success = data?.return === true || data?.status_code === 200;

    if (!success || data?.status_code === 999) {
      console.warn("⚠️ Fast2SMS rejected or requires recharge. Using email fallback...");
      if (email) await sendOtpEmail(email, otp);
      return;
    }

    if (debugOtp === "true") {
      console.log("📲 SMS Response:", JSON.stringify(data, null, 2));
    }

    console.log("✅ OTP sent via SMS to", phone);
  } catch (err) {
    console.error("❌ Fast2SMS error:", err.message || err);
    if (email) {
      console.warn("📧 Fallback: Sending OTP via email...");
      await sendOtpEmail(email, otp);
    }
  }
};
