import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  videoid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videofile", // ✅ Fix this if your video model is named "videofile"
    required: true,
  },
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewedOn: {
    type: Date,
    default: Date.now,
    expires: "90d",
  },
}, { timestamps: true });

historySchema.index({ viewedOn: -1 });

export default mongoose.model("History", historySchema);
