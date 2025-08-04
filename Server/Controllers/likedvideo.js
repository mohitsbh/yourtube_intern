import likedvideo from "../Models/likevideo.js";
import videofile from "../Models/videofile.js"; // ✅ Using videofile

// ✅ Add to Liked Videos
export const likedvideocontroller = async (req, res) => {
  const { viewer, videoid } = req.body;

  if (!viewer || !videoid) {
    return res.status(400).json({ message: "viewer and videoid are required" });
  }

  try {
    // 🔁 Prevent duplicate likes
    const existing = await likedvideo.findOne({ viewer, videoid });
    if (existing) {
      return res.status(200).json({ message: "Video already liked" });
    }

    const likedVideoEntry = new likedvideo({ viewer, videoid });
    await likedVideoEntry.save();

    res.status(201).json({ message: "Added to liked videos" });
  } catch (error) {
    console.error("❌ Like video error:", error.message);
    res.status(500).json({ message: "Failed to like video" });
  }
};

// 📥 Get All Liked Videos (with video details)
export const getalllikedvideo = async (req, res) => {
  try {
    const liked = await likedvideo.find();

    // ✅ Populate with video details from videofile
    const likedWithDetails = await Promise.all(
      liked.map(async (entry) => {
        const video = await videofile.findById(entry.videoid);
        return {
          ...entry._doc,
          videoDetails: video || null,
        };
      })
    );

    res.status(200).json(likedWithDetails);
  } catch (error) {
    console.error("❌ Fetch liked videos error:", error.message);
    res.status(500).json({ message: "Failed to fetch liked videos" });
  }
};

// ❌ Remove (unlike) a liked video
export const deletelikedvideo = async (req, res) => {
  const { videoid, viewer } = req.params;

  if (!videoid || !viewer) {
    return res.status(400).json({ message: "videoid and viewer are required" });
  }

  try {
    const result = await likedvideo.findOneAndDelete({ videoid, viewer });

    if (!result) {
      return res.status(404).json({ message: "Like not found" });
    }

    res.status(200).json({ message: "Removed from liked videos" });
  } catch (error) {
    console.error("❌ Delete liked video error:", error.message);
    res.status(500).json({ message: "Failed to remove liked video" });
  }
};
