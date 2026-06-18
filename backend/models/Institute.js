import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true, uppercase: true },
}, { timestamps: true });

export default mongoose.model("Institute", instituteSchema);
