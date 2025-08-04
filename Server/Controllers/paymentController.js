import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../Models/Auth.js";
import Order from "../Models/Order.js";
import Invoice from "../Models/Invoice.js";
import sendEmail from "../utils/sendEmail.js";
import videofile from "../Models/videofile.js"; // ✅ Added as requested

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_COSTS = { bronze: 10, silver: 50, gold: 100 };
const PLAN_LIMITS = { bronze: 7, silver: 10, gold: Infinity };

// ✅ Create Razorpay Order
export const createOrder = async (req, res) => {
  const { amount, planType } = req.body;
  const userId = req.user.id;

  if (!PLAN_COSTS[planType] || PLAN_COSTS[planType] !== amount)
    return res
      .status(400)
      .json({ message: "❌ Invalid plan or amount mismatch" });

  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorOrder = await razorpay.orders.create(options);

    await Order.create({
      user: userId,
      orderId: razorOrder.id,
      amount,
      planType,
      status: "CREATED",
    });

    res.status(200).json({ success: true, order: razorOrder });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// ✅ Verify Razorpay Payment and Activate Plan
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planType,
  } = req.body;
  const userId = req.user.id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "❌ Signature mismatch" });
  }

  try {
    // ✅ Update order status
    const order = await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: "PAID" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Update user plan
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = planType;
    user.videoDurationLimit = PLAN_LIMITS[planType];
    user.downloadsToday = 0;
    user.paidAt = new Date();
    await user.save();

    // ✅ Create invoice
    const invoice = await Invoice.create({
      user: user._id,
      order: order._id,
      planType,
      amount: order.amount,
    });

    // ✅ (Optional) Update user's uploaded videofiles if needed (placeholder logic)
    // For example: Tag old videos as premium
    await videofile.updateMany(
      { uploader: user._id },
      { $set: { isPremiumUploader: true } } // You may customize the logic
    );

    // ✅ Send Invoice Email
    await sendEmail(
      user.email,
      "✅ Invoice - Your Plan Purchase",
      `
      <h2>🎉 ${planType.toUpperCase()} Plan Activated</h2>
      <p><strong>Invoice ID:</strong> ${invoice._id}</p>
      <p><strong>Amount Paid:</strong> ₹${order.amount}</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p>Enjoy premium features on <strong>YourTube</strong>!</p>
    `
    );

    res.status(200).json({ success: true, plan: planType });
  } catch (err) {
    console.error("❌ Verify Payment Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
