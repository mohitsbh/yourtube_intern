import mongoose from "mongoose";

// 💬 Message schema: supports encrypted messages, media, and read receipts
const messageSchema = new mongoose.Schema(
  {
    // 🔗 Group this message belongs to
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },

    // 🧑 Sender's email (can switch to ObjectId if needed)
    sender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // 🔐 Encrypted message content
    content: {
      type: String,
      required: true,
    },

    // 🧷 Message type (for rendering in UI)
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },

    // ⏱️ When the message was sent
    timestamp: {
      type: Date,
      default: Date.now,
    },

    // 👀 List of user emails who have read this message
    readBy: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// 📌 Index to optimize chat pagination (by group and message time)
messageSchema.index({ groupId: 1, timestamp: 1 });

export default mongoose.model('Message', messageSchema);
