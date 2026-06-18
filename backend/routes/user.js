import express from "express";
import User from "../models/User.js";
import { requireAdmin, requireAuth, requireClerkToken } from "../lib/clerkAuth.js";

const router = express.Router();

// GET all users (admin)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET current user
router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

// POST sync user from Clerk
router.post("/sync", requireClerkToken, async (req, res) => {
  console.log("[backend /sync] Step 1: Route hit");
  console.log("[backend /sync] Step 2: clerkId from token =", req.clerkId);
  console.log("[backend /sync] Step 3: body =", req.body);
  try {
    const { email, name } = req.body;
    const clerkId = req.clerkId;

    if (!clerkId) {
      console.log("[backend /sync] ERROR: No clerkId");
      return res.status(400).json({ error: "No clerkId" });
    }

    console.log("[backend /sync] Step 4: Upserting user into MongoDB...");
    const user = await User.findOneAndUpdate(
      { clerkId },
      { clerkId, email, name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("[backend /sync] Step 5: User saved =", user);
    res.json(user);
  } catch (err) {
    console.error("[backend /sync] EXCEPTION:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH update role (admin only)
router.patch("/:id/role", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin", "institute"].includes(role))
      return res.status(400).json({ error: "Invalid role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
