import mongoose from "mongoose";

// ⏰ Watch Later Schema — tracks videos users saved to watch later
const watchLaterSchema = new mongoose.Schema(
  {
    // 🎥 Video reference (linked to actual uploaded video file)
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofile", // or "Video" if you're using the unified schema
      required: true,
    },

    // 👤 Viewer — storing user's email directly
    viewer: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// 🧠 Optional index for faster lookups
watchLaterSchema.index({ viewer: 1, videoid: 1 }, { unique: true }); // Prevent duplicates

export default mongoose.models.Watchlater || mongoose.model("Watchlater", watchLaterSchema);
