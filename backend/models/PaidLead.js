import mongoose from "mongoose";

// A paid lead — created when a promo payment is successfully verified. The
// original Lead record is kept; this is a separate record of the completed sale.
const paidLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  budget: { type: Number, default: null },
  college: { type: String, default: "" },
  visitDate: { type: String, default: "" },
  referralCode: { type: String, default: null },
  instituteName: { type: String, default: null },
  amount: { type: Number, default: 500 },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

export default mongoose.model("PaidLead", paidLeadSchema);
