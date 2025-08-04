// utils/getStateFromIP.js
import axios from "axios";

export const getStateFromIP = async (ip) => {
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
    return data.regionCode || "UNKNOWN"; // 'TN', 'KA', etc.
  } catch (err) {
    console.error("🌐 IP location fetch failed:", err.message);
    return "UNKNOWN";
  }
};
