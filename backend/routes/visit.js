import express from "express";
import Visit from "../models/Visit.js";
import { requireAdmin } from "../lib/clerkAuth.js";

const router = express.Router();

// POST create visit request (public)
router.post("/", async (req, res) => {
  try {
    const { name, phone, date, message, pgs } = req.body;
    if (!name || !phone || !date || !pgs?.length)
      return res.status(400).json({ error: "name, phone, date and pgs are required" });
    const visit = await Visit.create({ name, phone, date, message, pgs });
    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all visits (admin)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const visits = await Visit.find().sort({ createdAt: -1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status (admin)
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled"].includes(status))
      return res.status(400).json({ error: "Invalid status" });
    const visit = await Visit.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!visit) return res.status(404).json({ error: "Visit not found" });
    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
