import mongoose from "mongoose";

// ❤️ LikedVideo schema: tracks which user liked which video
const likedVideoSchema = new mongoose.Schema(
  {
    // 🔗 Reference to the liked video (videofile model)
    videofile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofile", // 👈 changed from "Video" to "videofile"
      required: true,
    },

    // 👤 Who liked the video
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🕒 When the video was liked
    likedon: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// 🔍 Prevent duplicate likes per user per video
likedVideoSchema.index({ videofile: 1, viewer: 1 }, { unique: true });

// 📈 Optional: For quick retrieval of recent likes
likedVideoSchema.index({ likedon: -1 });

export default mongoose.model("LikedVideo", likedVideoSchema);
