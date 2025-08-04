import mongoose from "mongoose";

const videoFileSchema = new mongoose.Schema(
  {
    // 🎬 Basic Metadata
    videotitle: { type: String, required: true, trim: true },
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    filetype: { type: String },
    filesize: { type: Number },

    // 📤 Upload Info
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videochanel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // 🧩 Transcoded Resolutions
    resolutions: {
      type: Map,
      of: String,
    },
    metrics: {
      type: Map,
      of: new mongoose.Schema(
        {
          views: { type: Number, default: 0 },
          downloads: { type: Number, default: 0 },
        },
        { _id: false }
      ),
    },

    // 🖼️ Thumbnail
    thumbnail: { type: String },

    // 📊 View Count
    views: { type: Number, default: 0 },

    // 📦 Processing Status
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "completed",
    },

    // 📈 Per-resolution download/view metrics (optional, if needed)
    // metrics: {
    //   type: Map,
    //   of: new mongoose.Schema(
    //     {
    //       views: { type: Number, default: 0 },
    //       downloads: { type: Number, default: 0 },
    //     },
    //     { _id: false }
    //   ),
    // },
  },
  { timestamps: true }
);

// 🔍 Text search optimization
videoFileSchema.index({ videotitle: "text" });

export default mongoose.models.videofile ||
  mongoose.model("videofile", videoFileSchema);
