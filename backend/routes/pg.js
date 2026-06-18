import express from "express";
import PG from "../models/PG.js";
import { upload, cloudinary } from "../lib/cloudinary.js";
import { requireAdmin, requireAuth } from "../lib/clerkAuth.js";

const router = express.Router();

// GET all PGs (public)
router.get("/", async (req, res) => {
  try {
    const { pgFor, minPrice, maxPrice, amenities, location, search } = req.query;
    const filter = { isPublished: true };
    if (pgFor) filter.pgFor = { $in: [pgFor, "Both"] };
    if (location) filter.location = new RegExp(location, "i");
    if (search) filter.name = new RegExp(search, "i");
    if (amenities) {
      const list = amenities.split(",");
      filter.commonAmenities = { $all: list };
    }

    const { limit } = req.query;
    let pgs = await PG.find(filter).sort({ createdAt: -1 }).limit(limit ? Number(limit) : 0);

    if (minPrice || maxPrice) {
      pgs = pgs.filter((pg) => {
        const prices = pg.rooms.map((r) => r.pricePerBed);
        const min = Math.min(...prices);
        if (minPrice && min < Number(minPrice)) return false;
        if (maxPrice && min > Number(maxPrice)) return false;
        return true;
      });
    }

    res.json(pgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single PG (public)
router.get("/:id", async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ error: "PG not found" });
    res.json(pg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create PG (admin only)
router.post(
  "/",
  requireAdmin,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const body = JSON.parse(req.body.data);
      const images = (req.files || []).map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));
      const pg = await PG.create({ ...body, images, createdBy: req.user._id });
      res.status(201).json(pg);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PATCH update PG (admin)
router.patch(
  "/:id",
  requireAdmin,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const body = JSON.parse(req.body.data);
      const newImages = (req.files || []).map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));
      const pg = await PG.findById(req.params.id);
      if (!pg) return res.status(404).json({ error: "Not found" });

      // merge images
      const keepImages = body.keepImages || [];
      const merged = [
        ...pg.images.filter((img) => keepImages.includes(img.publicId)),
        ...newImages,
      ];

      Object.assign(pg, { ...body, images: merged });
      await pg.save();
      res.json(pg);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE PG (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const pg = await PG.findByIdAndDelete(req.params.id);
    if (!pg) return res.status(404).json({ error: "Not found" });
    // delete images from cloudinary
    await Promise.all(
      pg.images.map((img) => cloudinary.uploader.destroy(img.publicId))
    );
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload room images for a specific room
router.post(
  "/:id/rooms/:roomIndex/images",
  requireAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const pg = await PG.findById(req.params.id);
      if (!pg) return res.status(404).json({ error: "Not found" });
      const room = pg.rooms[Number(req.params.roomIndex)];
      if (!room) return res.status(404).json({ error: "Room not found" });
      const newImages = (req.files || []).map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));
      room.images.push(...newImages);
      await pg.save();
      res.json(pg);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
