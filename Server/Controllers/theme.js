import { getStateFromIP } from "../utils/getStateFromIP.js";

export const getThemeSuggestion = async (req, res) => {
  try {
    // ✅ Get real IP address
    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // If on local network or localhost, default to a known IP (for testing)
    if (ip === "::1" || ip === "127.0.0.1") {
      ip = "157.49.2.1"; // Example IP from Tamil Nadu
    }

    // ✅ Resolve state from IP (await if async)
    const userState = await getStateFromIP(ip); // Expecting 'TN', 'KA', etc.
    const date = new Date();
    const hour = date.getHours();

    const southIndiaStates = ["TN", "KL", "KA", "AP", "TG"];

    const isSouth = southIndiaStates.includes(userState);
    const isMorning = hour >= 10 && hour < 12;

    const theme = isSouth && isMorning ? "light" : "dark";

    res.json({ theme, userState, hour });
  } catch (error) {
    console.error("❌ Theme detection error:", error.message);
    res.status(500).json({ message: "Could not detect theme" });
  }
};
