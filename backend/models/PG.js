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
    location: { type: String, required: true },
    pgFor: { type: String, enum: ["Girls", "Boys", "Both"], required: true },
    mealTypes: [String],
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
