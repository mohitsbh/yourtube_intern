import mongoose from "mongoose";
import videofile from "../Models/videofile.js";

// 📈 Increment Video Views
export const viewscontroller = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "❌ Invalid video ID" });
    }

    const updatedVideo = await videofile.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: "❌ Video not found" });
    }

    res.status(200).json({
      message: "✅ View count updated",
      views: updatedVideo.views,
      videoid: updatedVideo._id,
      videotitle: updatedVideo.videotitle, // optional for frontend
    });
  } catch (error) {
    console.error("❌ View Count Error:", error.message);
    res.status(500).json({ message: "Error updating views", error: error.message });
  }
};
