// Models/recording.js
import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  path: String,
  size: Number,
  mimetype: String,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Recording", recordingSchema);
