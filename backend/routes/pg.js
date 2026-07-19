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

// GET featured PGs (public) — ordered by the admin-set featuredOrder.
// NOTE: must be declared before "/:id" or Express treats "featured" as an id.
router.get("/featured", async (req, res) => {
  try {
    const pgs = await PG.find({ isFeatured: true, isPublished: true })
      .sort({ featuredOrder: 1, createdAt: -1 });
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH featured selection/order (admin) — body: { items: [{ id, order }] }
// Replaces the whole featured set in one call.
router.patch("/featured/set", requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    // Clear existing featured flags, then apply the new selection + order.
    await PG.updateMany({ isFeatured: true }, { $set: { isFeatured: false, featuredOrder: 0 } });
    await Promise.all(
      items.map((it, i) =>
        PG.findByIdAndUpdate(it.id, {
          $set: { isFeatured: true, featuredOrder: typeof it.order === "number" ? it.order : i },
        })
      )
    );
    const pgs = await PG.find({ isFeatured: true }).sort({ featuredOrder: 1 });
    res.json(pgs);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// Map a multer file to our stored image shape.
const toImage = (f) => ({ url: f.path, publicId: f.filename });

// Group uploaded files by field name. Cover images arrive under "images";
// room images arrive under "roomImages_<index>".
function groupFiles(files) {
  const cover = [];
  const roomsByIndex = {}; // { [index]: [image, ...] }
  for (const f of files || []) {
    if (f.fieldname === "images") {
      cover.push(toImage(f));
    } else if (f.fieldname.startsWith("roomImages_")) {
      const idx = Number(f.fieldname.slice("roomImages_".length));
      (roomsByIndex[idx] ||= []).push(toImage(f));
    }
  }
  return { cover, roomsByIndex };
}

// POST create PG (admin only)
router.post(
  "/",
  requireAdmin,
  upload.any(), // accepts "images" + any "roomImages_<i>" fields
  async (req, res) => {
    try {
      const body = JSON.parse(req.body.data);
      const { cover, roomsByIndex } = groupFiles(req.files);

      const rooms = (body.rooms || []).map((room, i) => ({
        ...room,
        images: roomsByIndex[i] || [],
      }));

      const pg = await PG.create({
        ...body,
        images: cover,
        rooms,
        createdBy: req.user._id,
      });
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
  upload.any(),
  async (req, res) => {
    try {
      const body = JSON.parse(req.body.data);
      const { cover, roomsByIndex } = groupFiles(req.files);

      const pg = await PG.findById(req.params.id);
      if (!pg) return res.status(404).json({ error: "Not found" });

      // Cover images: keep the ones the admin didn't delete, add the new ones.
      const keepImages = body.keepImages || [];
      const mergedCover = [
        ...pg.images.filter((img) => keepImages.includes(img.publicId)),
        ...cover,
      ];

      // Rooms: per room, keep the retained existing images and add new uploads.
      // Existing room images are matched from the current PG doc by index.
      const rooms = (body.rooms || []).map((room, i) => {
        const keepImageIds = room.keepImageIds || [];
        const existing = pg.rooms[i]?.images || [];
        const keptImages = existing.filter((img) =>
          keepImageIds.includes(img.publicId)
        );
        const { keepImageIds: _drop, ...roomFields } = room;
        return { ...roomFields, images: [...keptImages, ...(roomsByIndex[i] || [])] };
      });

      Object.assign(pg, { ...body, images: mergedCover, rooms });
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
  upload.array("images", 100),
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
