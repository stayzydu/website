import mongoose from "mongoose";

// A lead — saved as soon as the promo form is filled, before any payment.
// Stays here even after the person pays (a PaidLead is created separately).
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  budget: { type: Number, default: null },   // ₹/month
  college: { type: String, default: "" },
  visitDate: { type: String, default: "" },  // YYYY-MM-DD
  referralCode: { type: String, default: null },
  instituteName: { type: String, default: null },
  razorpayOrderId: { type: String, default: null }, // latest order id (to match on verify)
  paid: { type: Boolean, default: false },   // flipped true once they pay
}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);
