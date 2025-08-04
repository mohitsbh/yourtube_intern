import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoid: { type: mongoose.Schema.Types.ObjectId, ref: "videofile", required: true },
  resolution: { type: String, required: true },
  downloadedAt: { type: Date, default: Date.now },
  plan: { type: String, enum: ["free", "bronze", "silver", "gold"], required: true },
});

// 🔍 Indexes
downloadSchema.index({ userId: 1, videoid: 1 });
downloadSchema.index({ downloadedAt: -1 });
downloadSchema.index({ userId: 1, downloadedAt: -1 });

export default mongoose.model("Download", downloadSchema);
