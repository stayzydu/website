import mongoose from "mongoose";

const promoPaymentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  budget: { type: Number, default: null },          // ₹/month the student can spend
  college: { type: String, default: "" },           // college / campus
  visitDate: { type: String, default: "" },         // preferred visit date (YYYY-MM-DD)
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  amount: { type: Number, default: 500 },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  referralCode: { type: String, default: null },
  instituteName: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("PromoPayment", promoPaymentSchema);
