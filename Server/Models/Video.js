import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    videotitle: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    category: { type: String },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videochanel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    filetype: { type: String },
    filesize: { type: Number },
    duration: { type: Number },
    resolutions: { type: Map, of: String },
    thumbnail: { type: String },
    metrics: {
      type: Map,
      of: new mongoose.Schema(
        { views: { type: Number, default: 0 }, downloads: { type: Number, default: 0 } },
        { _id: false }
      ),
    },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "completed",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

videoSchema.index({ videotitle: "text", description: "text", category: "text" });

export default mongoose.models.Video || mongoose.model("Video", videoSchema);
