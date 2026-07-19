import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Lead from "../models/Lead.js";
import PaidLead from "../models/PaidLead.js";
import Institute from "../models/Institute.js";
import Referral from "../models/Referral.js";
import { requireAdmin } from "../lib/clerkAuth.js";

const router = express.Router();

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Resolve an optional referral code → { instituteName, resolvedCode }.
async function resolveReferral(referralCode) {
  if (!referralCode || !referralCode.trim()) return { instituteName: null, resolvedCode: null };
  const institute = await Institute.findOne({ referralCode: referralCode.trim().toUpperCase() });
  return institute
    ? { instituteName: institute.name, resolvedCode: institute.referralCode }
    : { instituteName: null, resolvedCode: null };
}

// Build the lead detail fields common to save-lead and create-order.
function leadDetails({ name, phone, budget, college, visitDate, resolvedCode, instituteName }) {
  return {
    name,
    phone,
    budget: budget != null && budget !== "" ? Number(budget) : null,
    college: college?.trim() || "",
    visitDate: visitDate || "",
    referralCode: resolvedCode,
    instituteName,
  };
}

// Save (or refresh) the LEAD as soon as the form is filled — before payment,
// so it's captured even if they never pay. Upsert by phone into `leads`.
router.post("/save-lead", async (req, res) => {
  try {
    const { name, phone, referralCode, budget, college, visitDate } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });
    const cleanPhone = phone.trim();

    const { instituteName, resolvedCode } = await resolveReferral(referralCode);
    const details = leadDetails({ name, phone: cleanPhone, budget, college, visitDate, resolvedCode, instituteName });

    await Lead.findOneAndUpdate(
      { phone: cleanPhone },
      { $set: details },            // don't touch `paid` — a paid lead stays paid
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ saved: true });
  } catch (err) {
    console.error("[promo/save-lead]", err);
    res.status(500).json({ error: err.message || "Failed to save lead" });
  }
});

// Create Razorpay order (also ensures the lead exists / is refreshed)
router.post("/create-order", async (req, res) => {
  try {
    const { name, phone, referralCode, budget, college, visitDate } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });
    const cleanPhone = phone.trim();

    const { instituteName, resolvedCode } = await resolveReferral(referralCode);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: `promo_${Date.now()}`,
    });

    // Refresh the lead and stamp the latest order id (so verify can find it).
    const details = {
      ...leadDetails({ name, phone: cleanPhone, budget, college, visitDate, resolvedCode, instituteName }),
      razorpayOrderId: order.id,
    };
    await Lead.findOneAndUpdate(
      { phone: cleanPhone },
      { $set: details },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      instituteName,
    });
  } catch (err) {
    console.error("[promo/create-order]", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

// Verify payment — mark the lead paid AND create a PaidLead record.
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Find the lead this order belongs to and flag it paid (kept in `leads`).
    const lead = await Lead.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { $set: { paid: true } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: "Lead not found for this order" });

    // Copy into the paid-leads collection (idempotent by phone).
    await PaidLead.findOneAndUpdate(
      { phone: lead.phone },
      {
        $set: {
          name: lead.name,
          phone: lead.phone,
          budget: lead.budget,
          college: lead.college,
          visitDate: lead.visitDate,
          referralCode: lead.referralCode,
          instituteName: lead.instituteName,
          amount: 500,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Record the institute referral claim if a code was used.
    if (lead.referralCode) {
      const institute = await Institute.findOne({ referralCode: lead.referralCode });
      if (institute) {
        const alreadyClaimed = await Referral.findOne({ phone: lead.phone });
        if (!alreadyClaimed) {
          await Referral.create({ instituteId: institute._id, name: lead.name, phone: lead.phone });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[promo/verify]", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Admin — all leads (filled the form; may or may not have paid)
router.get("/leads", requireAdmin, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// Admin — paid leads only
router.get("/paid-leads", requireAdmin, async (req, res) => {
  try {
    const paid = await PaidLead.find().sort({ createdAt: -1 });
    res.json(paid);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch paid leads" });
  }
});

// Back-compat alias for the old Paid Users tab.
router.get("/payments", requireAdmin, async (req, res) => {
  try {
    const paid = await PaidLead.find().sort({ createdAt: -1 });
    res.json(paid);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch paid leads" });
  }
});

export default router;
