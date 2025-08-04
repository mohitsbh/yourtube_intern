import mongoose from "mongoose";
import videofile from "../Models/videofile.js";

export const likevideocontroller = async (req, res) => {
  const { id: _id } = req.params;
  const { Like } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(400).json({ message: "Invalid video ID" });

  if (typeof Like !== "number" || Like < 0)
    return res.status(400).json({ message: "Invalid Like value" });

  try {
    const video = await videofile.findByIdAndUpdate(
      _id,
      { $set: { likes: Like } },
      { new: true }
    );

    if (!video)
      return res.status(404).json({ message: "Video not found" });

    res.status(200).json({ message: "Like updated", video });
  } catch (err) {
    console.error("❌ Like update error:", err.message);
    res.status(500).json({ message: "Failed to update like" });
  }
};
