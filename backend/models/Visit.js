import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  message: { type: String },
  pgs: [{ id: String, name: String, location: String }],
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Visit", visitSchema);
