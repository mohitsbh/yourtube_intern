import watchlater from "../Models/watchlater.js";
import mongoose from "mongoose";
import videofile from "../Models/videofile.js"; // ✅ Import the correct model

// ✅ Add to Watch Later
export const addToWatchLater = async (req, res) => {
  try {
    const { videoid } = req.body;
    const viewer = req.user?.id || req.userEmail;

    if (!videoid || !viewer) {
      return res.status(400).json({ message: "Missing video ID or user info" });
    }

    if (!mongoose.Types.ObjectId.isValid(videoid)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const exists = await watchlater.findOne({ videoid, viewer });
    if (exists) {
      return res.status(409).json({ message: "Already added to Watch Later" });
    }

    const saved = new watchlater({ videoid, viewer });
    await saved.save();

    res.status(201).json({ message: "Added to Watch Later", item: saved });
  } catch (error) {
    console.error("❌ Add Watch Later Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while adding to Watch Later" });
  }
};

// ✅ Get All Watch Later (with videofile)
export const getAllWatchLater = async (req, res) => {
  try {
    const viewer = req.user?.id || req.userEmail;
    if (!viewer) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const items = await watchlater
      .find({ viewer })
      .populate({ path: "videoid", model: videofile }) // ✅ Use correct model
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    console.error("❌ Get Watch Later Error:", error.message);
    res.status(500).json({ message: "Failed to retrieve Watch Later list" });
  }
};

// ✅ Remove from Watch Later
export const deleteWatchLater = async (req, res) => {
  try {
    const { videoid } = req.params;
    const viewer = req.user?.id || req.userEmail;

    if (!mongoose.Types.ObjectId.isValid(videoid)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const deleted = await watchlater.findOneAndDelete({ videoid, viewer });
    if (!deleted) {
      return res.status(404).json({ message: "Item not found in Watch Later" });
    }

    res.status(200).json({ message: "Removed from Watch Later" });
  } catch (error) {
    console.error("❌ Delete Watch Later Error:", error.message);
    res.status(500).json({ message: "Failed to remove item from Watch Later" });
  }
};
