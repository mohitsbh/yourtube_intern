import mongoose from "mongoose";

const voipRecordingSchema = new mongoose.Schema({
  callId: { type: String, required: true },
  sender: { type: String, required: true },      // email or userId
  receiver: { type: String, required: true },    // email or userId
  filePath: { type: String, required: true },    // relative path
  fileType: { type: String, required: true },    // e.g. webm/mp4/wav
  duration: { type: Number },                    // in seconds (optional)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("VoipRecording", voipRecordingSchema);
