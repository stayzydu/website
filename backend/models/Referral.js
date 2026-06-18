import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model("Referral", referralSchema);
