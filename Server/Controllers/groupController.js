import Group from "../Models/Group.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Create Group
export const createGroup = async (req, res) => {
  const { name, members } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!name || !Array.isArray(members) || members.length === 0)
    return res.status(400).json({ message: "Invalid group data" });

  try {
    const exists = await Group.findOne({ name: name.trim() });
    if (exists)
      return res.status(400).json({ message: "Group name already exists" });

    const uniqueMembers = [
      ...new Set(members.map((e) => e.trim().toLowerCase())),
    ];

    const group = await Group.create({
      name: name.trim(),
      createdBy: userId,
      members: uniqueMembers,
    });

    await Promise.all(
      uniqueMembers.map(async (email) => {
        try {
          await transporter.sendMail({
            from: `"Group Invite" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You're invited to join group: ${name.trim()}`,
            text: `Hi! You've been invited to the group "${name.trim()}".`,
          });
        } catch (err) {
          console.warn(`📧 Failed to send invite to ${email}: ${err.message}`);
        }
      })
    );

    res.status(201).json(group);
  } catch (err) {
    console.error("❌ Create Group Error:", err);
    res.status(500).json({ message: "Unable to create group" });
  }
};

// 🔍 Search Groups
export const searchGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      name: { $regex: req.query.query?.trim() || "", $options: "i" },
    }).populate("createdBy", "email");

    res.status(200).json(groups);
  } catch (err) {
    console.error("❌ Search Error:", err);
    res.status(500).json({ message: "Failed to search groups" });
  }
};

// 📥 Get User Groups
export const getUserGroups = async (req, res) => {
  const email = req.userEmail?.toLowerCase();
  if (!email) return res.status(401).json({ message: "Unauthorized" });

  try {
    const groups = await Group.find({ members: email }).populate(
      "createdBy",
      "email"
    );
    res.status(200).json(groups);
  } catch (err) {
    console.error("❌ Fetch User Groups Error:", err);
    res.status(500).json({ message: "Unable to fetch groups" });
  }
};

// ✏️ Update Group
export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, members } = req.body;
  const userId = req.userId;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== userId)
      return res
        .status(403)
        .json({ message: "Only the creator can update the group" });

    const conflict = await Group.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (conflict)
      return res.status(400).json({ message: "Group name already taken" });

    group.name = name.trim();
    group.members = [...new Set(members.map((e) => e.trim().toLowerCase()))];
    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("❌ Update Group Error:", err);
    res.status(500).json({ message: "Server error while updating group" });
  }
};

// ❌ Delete Group
export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== userId)
      return res
        .status(403)
        .json({ message: "Only the creator can delete the group" });

    await group.deleteOne();
    res.status(200).json({ message: "Group deleted", id });
  } catch (err) {
    console.error("❌ Delete Group Error:", err);
    res.status(500).json({ message: "Failed to delete group" });
  }
};

// ➕➖ Update Members
export const updateGroupMembers = async (req, res) => {
  const { id } = req.params;
  const { add = [], remove = [] } = req.body;
  const userId = req.userId;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== userId)
      return res
        .status(403)
        .json({ message: "Only the creator can update members" });

    const membersSet = new Set(group.members);
    add.forEach((email) => membersSet.add(email.trim().toLowerCase()));
    remove.forEach((email) => membersSet.delete(email.trim().toLowerCase()));

    group.members = [...membersSet];
    await group.save();

    res
      .status(200)
      .json({ message: "Members updated", members: group.members });
  } catch (err) {
    console.error("❌ Update Members Error:", err);
    res.status(500).json({ message: "Failed to update members" });
  }
};
