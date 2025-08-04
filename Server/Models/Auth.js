import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ✅ User Schema Definition
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: 6,
      // ❗ Explicitly mark not required for Google login
      required: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows null values with unique
      index: true,
    },

    // 🔸 Subscription Plan Logic
    plan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },
    videoDurationLimit: {
      type: Number,
      default: 5, // free plan default
    },

    // 🔸 Download Tracking
    downloadsToday: {
      type: Number,
      default: 0,
    },
    lastDownloadDate: {
      type: Date,
      default: () => new Date(),
    },
    downloadInfo: {
      date: { type: Date },
      count: { type: Number, default: 0 },
    },
    downloadHistory: [
      {
        videoid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "videofile",
        },
        resolution: {
          type: String,
          default: "360p",
        },
        downloadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🔸 Watch Time History
    lastWatchDate: {
      type: Date,
      default: () => new Date(),
    },
    dailyWatchHistory: {
      type: Map,
      of: Number,
      default: {},
    },

    // 🔸 Payment
    paidAt: Date,
  },
  { timestamps: true }
);

// 🔐 Hash password if set and modified
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔐 Password check
userSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(plainPassword, this.password);
};

// 🏆 Virtual field to check premium
userSchema.virtual("isPremium").get(function () {
  return this.plan !== "free";
});

export default mongoose.model("User", userSchema);
