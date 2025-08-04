import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [String],
      required: true,
      validate: {
        validator: (emails) => Array.isArray(emails) && emails.length > 0,
        message: "A group must have at least one member.",
      },
      set: (emails) => emails.map((email) => email.trim().toLowerCase()),
    },
    groupType: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
  },
  { timestamps: true }
);

groupSchema.index({ members: 1 });
groupSchema.index({ name: "text" });

export default mongoose.model("Group", groupSchema);
