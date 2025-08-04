import jwt from "jsonwebtoken";
import User from "../Models/Auth.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 🔐 Login or Auto-Register
export const login = async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!isValidEmail(email))
    return res.status(400).json({ message: "Invalid email format" });

  try {
    let user = await User.findOne({ email });

    if (!user) {
      if (!name)
        return res
          .status(400)
          .json({ message: "Name is required for new users" });
      user = await User.create({ email, name });
    } else if (!user.name && name) {
      user.name = name;
      await user.save();
    }

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ message: "JWT secret not configured" });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      result: {
        _id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        videoDurationLimit: user.videoDurationLimit,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};

// 👤 Fetch user by token
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};
