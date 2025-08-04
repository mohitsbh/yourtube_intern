import crypto from "crypto";
import Message from "../Models/Message.js";
import Group from "../Models/Group.js";
import sendEmail from "../utils/sendEmail.js";

const SECRET = process.env.CHAT_SECRET || "super_secure_secret";
const IV_LENGTH = 16;

const getKey = () => crypto.createHash("sha256").update(SECRET).digest();

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  return `${iv.toString("hex")}:${
    cipher.update(text, "utf8", "hex") + cipher.final("hex")
  }`;
};

const decrypt = (encryptedText) => {
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  } catch (err) {
    console.warn("Decryption failed:", err.message);
    return "[Decryption Failed]";
  }
};

const isUserInGroup = (group, email) => group.members.includes(email);

// 📩 POST: Send encrypted message
export const sendMessage = async (req, res) => {
  const { groupId, content, type = "text" } = req.body;
  const sender = req.userEmail;
  if (!groupId || !content?.trim())
    return res
      .status(400)
      .json({ message: "groupId and content are required" });

  try {
    const group = await Group.findById(groupId);
    if (!group || !isUserInGroup(group, sender))
      return res.status(403).json({ message: "Access denied to group" });

    const encrypted = encrypt(content.trim());
    const message = await Message.create({
      groupId,
      sender,
      content: encrypted,
      type,
      timestamp: new Date(),
    });

    const recipients = group.members.filter((m) => m !== sender);
    await Promise.all(
      recipients.map((email) =>
        sendEmail(
          email,
          `📩 New Message in ${group.name}`,
          `<p><strong>${sender}</strong>: ${content}</p>`
        )
      )
    );

    res.status(201).json({ ...message._doc, content });
  } catch (err) {
    console.error("Send Message Error:", err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
};

// 📄 GET: All messages (decrypted)
export const getMessages = async (req, res) => {
  const { groupId } = req.params,
    userEmail = req.userEmail;

  try {
    const group = await Group.findById(groupId);
    if (!group || !isUserInGroup(group, userEmail))
      return res.status(403).json({ message: "Access denied" });

    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    res
      .status(200)
      .json(
        messages.map((msg) => ({ ...msg._doc, content: decrypt(msg.content) }))
      );
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: err.message });
  }
};

// ⏩ GET: Latest N messages
export const getLatestMessages = async (req, res) => {
  const { groupId } = req.params,
    limit = +req.query.limit || 20,
    userEmail = req.userEmail;

  try {
    const group = await Group.findById(groupId);
    if (!group || !isUserInGroup(group, userEmail))
      return res.status(403).json({ message: "Access denied" });

    const messages = await Message.find({ groupId })
      .sort({ timestamp: -1 })
      .limit(limit);
    res
      .status(200)
      .json(
        messages
          .reverse()
          .map((msg) => ({ ...msg._doc, content: decrypt(msg.content) }))
      );
  } catch (err) {
    console.error("Fetch Latest Messages Error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: err.message });
  }
};

// 📜 GET: Paginated messages (before a timestamp)
export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params,
    limit = +req.query.limit || 20;
  const before = req.query.before ? new Date(req.query.before) : new Date();

  try {
    const messages = await Message.find({ groupId, timestamp: { $lt: before } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      messages: messages.map((msg) => ({
        ...msg,
        content: decrypt(msg.content),
      })),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("❌ Error fetching paginated group messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
