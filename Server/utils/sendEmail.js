import nodemailer from "nodemailer";

/**
 * Sends an email via Gmail SMTP. Falls back to mock log in development mode.
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML content for the body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const textFallback = html.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags

    // 📦 Development Mode: Log instead of sending
    if (process.env.NODE_ENV === "development") {
      console.log(`📨 [DEV MODE] Mock Email:
To: ${to}
Subject: ${subject}
Body (Text): ${textFallback}`);
      return;
    }

    // ✉️ Gmail SMTP Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"YourTube Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textFallback,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to} - Message ID: ${info.messageId}`);

    if (process.env.DEBUG_EMAIL === "true") {
      console.log(`📨 Debug Email Payload:\n${JSON.stringify(mailOptions, null, 2)}`);
    }
  } catch (error) {
    console.error("❌ Email sending failed:", {
      message: error.message,
      stack: error.stack,
    });
  }
};

export default sendEmail;
