import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  videoid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videofile",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentbody: { type: String, required: true, trim: true },
  usercommented: { type: String, required: true },
  location: String,
  latitude: Number,
  longitude: Number,
  countryCode: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  translated: { type: Map, of: String, default: {} },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comments",
    default: null,
  },
  deviceInfo: String,
  commentedon: { type: Date, default: Date.now },
});

// 🔍 Indexes
commentSchema.index({ videoid: 1, commentedon: -1 });
commentSchema.index({ commentbody: "text", "translated.en": "text" });

export default mongoose.model("Comments", commentSchema);
