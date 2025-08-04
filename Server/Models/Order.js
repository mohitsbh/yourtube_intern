import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null },
    planType: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED"],
      default: "CREATED",
    },
    
    receipt: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
