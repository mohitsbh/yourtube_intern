import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    
    invoiceNumber: {
      type: String,
      unique: true,
      default: () =>
        `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    emailSnapshot: { type: String, default: null },
    sentToEmail: { type: String, default: null, lowercase: true, trim: true },
    pdfUrl: { type: String, default: null },
    planType: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "razorpay" },
    status: { type: String, enum: ["paid", "failed"], default: "paid" },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

invoiceSchema.index({ user: 1, issuedAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });

export default mongoose.model("Invoice", invoiceSchema);
