import mongoose from "mongoose";
import axios from "axios";
import comment from "../Models/comment.js";

// 📝 Post comment with geolocation
export const postcomment = async (req, res) => {
  const { videoid, userId, commentbody, usercommented, latitude, longitude } =
    req.body;
  if (!userId || !commentbody?.trim())
    return res.status(400).json({ message: "Invalid comment" });

  let city = "Unknown",
    countryCode = null,
    finalLat = latitude || null,
    finalLon = longitude || null;

  try {
    if (latitude && longitude) {
      const geo = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: { lat: latitude, lon: longitude, format: "json" },
          headers: { "User-Agent": "your-app-name" },
        }
      );
      const a = geo.data.address;
      city = `${a.city || a.town || a.village || "Unknown"}, ${
        a.state || ""
      }, ${a.country || ""}`;
      countryCode = a.country_code?.toUpperCase() || null;
    } else {
      const ip = (
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        ""
      )
        .replace("::ffff:", "")
        .trim();
      const finalIp = ["127.0.0.1", "::1", "", null].includes(ip)
        ? "8.8.8.8"
        : ip;
      const { data } = await axios.get(`https://ipapi.co/${finalIp}/json/`);
      city = `${data.city}, ${data.region}, ${data.country_name}`;
      finalLat = data.latitude;
      finalLon = data.longitude;
      countryCode = data.country_code;
    }
  } catch (err) {
    console.error("🌍 Location lookup failed:", err.message);
  }

  try {
    const newComment = await comment.create({
      videoid,
      userId,
      commentbody,
      usercommented,
      location: city,
      latitude: finalLat,
      longitude: finalLon,
      countryCode,
    });
    res.status(200).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 👍 Like comment (toggle)
export const likeComment = async (req, res) => {
  const { id } = req.params,
    { userId } = req.body;
  try {
    const cmt = await comment.findById(id);
    if (!cmt) return res.status(404).json({ message: "Comment not found" });

    const liked = cmt.likes.includes(userId);
    if (liked) cmt.likes.pull(userId);
    else {
      cmt.likes.push(userId);
      cmt.dislikes.pull(userId);
    }

    await cmt.save();
    res.status(200).json(cmt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 👎 Dislike comment (toggle + delete if ≥ 2)
export const dislikeComment = async (req, res) => {
  const { id } = req.params,
    { userId } = req.body;
  try {
    const cmt = await comment.findById(id);
    if (!cmt) return res.status(404).json({ message: "Comment not found" });

    const disliked = cmt.dislikes.includes(userId);
    if (disliked) cmt.dislikes.pull(userId);
    else {
      cmt.dislikes.push(userId);
      cmt.likes.pull(userId);
    }

    if (cmt.dislikes.length >= 2) {
      await cmt.deleteOne();
      return res.status(200).json({ deleted: true, id: cmt._id });
    }

    await cmt.save();
    res.status(200).json(cmt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🌐 Translate (mock)
export const translateComment = async (req, res) => {
  const { id } = req.params,
    { lang } = req.body;
  try {
    const cmt = await comment.findById(id);
    if (!cmt) return res.status(404).json({ message: "Comment not found" });

    if (!cmt.translated?.get(lang)) {
      cmt.translated.set(lang, `[${lang}] ${cmt.commentbody}`);
      await cmt.save();
    }

    res.status(200).json({ translated: cmt.translated.get(lang) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📥 All comments
export const getcomment = async (_req, res) => {
  try {
    const all = await comment.find();
    res.status(200).json(all);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete comment
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(400).send("Invalid comment ID");
  try {
    await comment.findByIdAndDelete(_id);
    res.status(200).json({ message: "Deleted successfully", id: _id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
};

// ✏️ Edit comment
export const editcomment = async (req, res) => {
  const { id } = req.params,
    { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No comment with that ID");
  try {
    const updated = await comment.findByIdAndUpdate(
      id,
      { commentbody },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
