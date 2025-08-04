import nodemailer from "nodemailer";

/**
 * Sends a one-time password (OTP) to the user's email.
 *
 * @param {string} email - Recipient email
 * @param {string} otp - The OTP code to send
 */
export const sendOtpEmail = async (email, otp) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">
        <h2>🔐 Your OTP Code</h2>
        <p>Use the following one-time password to continue:</p>
        <div style="font-size: 20px; font-weight: bold; margin: 10px 0;">${otp}</div>
        <p>This code is valid for only a few minutes. Do not share it with anyone.</p>
        <hr />
        <small>If you did not request this, please ignore this email.</small>
      </div>
    `;
    const text = html.replace(/<\/?[^>]+(>|$)/g, ""); // Strip tags for plain fallback

    // 🧪 Development mode
    if (process.env.NODE_ENV === "development") {
      console.log(`📨 [DEV MODE] Mock OTP Email to ${email}: ${otp}`);
      return;
    }

    // ✉️ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 📦 Mail options
    const mailOptions = {
      from: `"YourTube Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your One-Time Password (OTP)",
      text,
      html,
    };

    // 📬 Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ OTP email sent to ${email} - Message ID: ${info.messageId}`
    );

    // 🐞 Optional debug output
    if (process.env.DEBUG_EMAIL === "true") {
      console.log(
        `📨 Debug Email Payload:\n${JSON.stringify(mailOptions, null, 2)}`
      );
    }
  } catch (error) {
    console.error("❌ Failed to send OTP email:", {
      message: error.message,
      stack: error.stack,
    });
    throw new Error("Failed to send OTP email.");
  }
};
