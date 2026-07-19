import express from "express";
import crypto from "crypto";
import Institute from "../models/Institute.js";
import Referral from "../models/Referral.js";
import PaidLead from "../models/PaidLead.js";
import User from "../models/User.js";
import { requireAdmin, requireAuth } from "../lib/clerkAuth.js";

const router = express.Router();

function generateCode(name) {
  const slug = name.replace(/\s+/g, "").toUpperCase().slice(0, 6);
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${slug}${rand}`;
}

// Admin: create institute profile for a user (sets role to institute)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { userId, name, referralCode } = req.body;
    if (!userId || !name) return res.status(400).json({ error: "userId and name required" });

    const code = referralCode
      ? referralCode.trim().toUpperCase()
      : generateCode(name);

    // check uniqueness
    const existing = await Institute.findOne({ referralCode: code });
    if (existing) return res.status(400).json({ error: "Referral code already in use, try another" });

    const institute = await Institute.create({ userId, name, referralCode: code });

    // update user role
    await User.findByIdAndUpdate(userId, { role: "institute" });

    res.json(institute);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all institutes with referral counts
router.get("/", requireAdmin, async (req, res) => {
  try {
    const institutes = await Institute.find().populate("userId", "name email").sort({ createdAt: -1 });
    const counts = await Referral.aggregate([
      { $group: { _id: "$instituteId", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
    const result = institutes.map(i => ({
      ...i.toObject(),
      referralCount: countMap[i._id.toString()] || 0,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get referral claims for a specific institute
router.get("/:id/referrals", requireAdmin, async (req, res) => {
  try {
    const referrals = await Referral.find({ instituteId: req.params.id }).sort({ createdAt: -1 });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Institute: get own profile + referrals
router.get("/me", requireAuth, async (req, res) => {
  try {
    const institute = await Institute.findOne({ userId: req.user._id });
    if (!institute) return res.status(404).json({ error: "Not an institute" });
    const referrals = await Referral.find({ instituteId: institute._id }).sort({ createdAt: -1 });
    res.json({ institute, referrals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: validate referral code (returns institute name or error)
router.post("/validate-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });
    const institute = await Institute.findOne({ referralCode: code.trim().toUpperCase() });
    if (!institute) return res.status(404).json({ error: "Invalid referral code" });
    res.json({ valid: true, instituteName: institute.name, instituteId: institute._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: check if phone is already used (called before payment)
router.post("/check-phone", async (req, res) => {
  try {
    const { phone } = req.body;
    const existing = await PaidLead.findOne({ phone: phone.trim() });
    if (existing) return res.json({ used: true });
    res.json({ used: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
