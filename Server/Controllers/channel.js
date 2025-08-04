import mongoose from "mongoose";
import users from "../Models/Auth.js";

// 🛠 Update channel name and desc
export const updatechaneldata = async (req, res) => {
  const { id: _id } = req.params;
  const { name, desc } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(400).json({ message: "Invalid channel ID" });rs
  try {
    const updatedData = await users.findByIdAndUpdate(
      _id,
      { $set: { name: name?.trim(), desc: desc?.trim() } },
      { new: true }
    );
    if (!updatedData)
      return res.status(404).json({ message: "Channel not found" });
    res.status(200).json(updatedData);
  } catch {
    res.status(500).json({ message: "Failed to update channel" });
  }
};

// 📦 Get all channels (name, email, desc only)
export const getallchanels = async (req, res) => {
  try {
    const allchanels = await users.find({}, "_id name email desc");
    res.status(200).json(allchanels);
  } catch {
    res.status(500).json({ message: "Failed to fetch channels" });
  }
};
