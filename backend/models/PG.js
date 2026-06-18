import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  type: { type: String, enum: ["Single", "Double", "Triple"], required: true },
  pricePerBed: { type: Number, required: true },
  amenities: [String],
  images: [{ url: String, publicId: String }],
});

const pgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: [{ url: String, publicId: String }],
    managerName: { type: String, required: true },
    location: { type: String, required: true },
    pgFor: { type: String, enum: ["Girls", "Boys", "Both"], required: true },
    lockInPeriod: { type: String, default: "" },
    mealTypes: [String],
    noticePeriod: { type: String, default: "" },
    commonAmenities: [String],
    thingsToKnow: {
      allowed: [String],
      notAllowed: [String],
    },
    mapLat: { type: Number },
    mapLng: { type: Number },
    rooms: [roomSchema],
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("PG", pgSchema);
