import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import PromoPayment from "../models/PromoPayment.js";
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

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { name, phone, referralCode } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });

    // Block reuse of same phone number
    const existing = await PromoPayment.findOne({ phone: phone.trim() });
    if (existing) return res.status(400).json({ error: "This number has already been used for a payment" });

    // Resolve referral
    let instituteName = null;
    let resolvedCode = null;
    if (referralCode && referralCode.trim()) {
      const institute = await Institute.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (institute) {
        instituteName = institute.name;
        resolvedCode = institute.referralCode;
      }
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: `promo_${Date.now()}`,
    });

    await PromoPayment.create({
      name,
      phone: phone.trim(),
      razorpayOrderId: order.id,
      referralCode: resolvedCode,
      instituteName,
    });

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

// Verify payment — also records referral claim
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

    const payment = await PromoPayment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, status: "paid" },
      { new: true }
    );

    // Record referral if code was used
    if (payment?.referralCode) {
      const institute = await Institute.findOne({ referralCode: payment.referralCode });
      if (institute) {
        // idempotent — skip if phone already recorded
        const alreadyClaimed = await Referral.findOne({ phone: payment.phone });
        if (!alreadyClaimed) {
          await Referral.create({
            instituteId: institute._id,
            name: payment.name,
            phone: payment.phone,
          });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[promo/verify]", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Admin — get all payments
router.get("/payments", requireAdmin, async (req, res) => {
  try {
    const payments = await PromoPayment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

export default router;
