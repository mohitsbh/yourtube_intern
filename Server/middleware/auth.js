import jwt from "jsonwebtoken";

// 🔐 Middleware: Verify JWT and extract user data
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🚫 No token provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET missing from environment");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 Attach user data to request
    req.user = decoded;
    req.userEmail = decoded.email;
    req.userId = decoded.id;

    next(); // ✅ Auth success
  } catch (err) {
    console.error("❌ JWT Auth Error:", err.message);
    return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
};

export default auth;
