import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import pgRoutes from "./routes/pg.js";
import userRoutes from "./routes/user.js";
import visitRoutes from "./routes/visit.js";
import promoRoutes from "./routes/promo.js";
import instituteRoutes from "./routes/institute.js";
import User from "./models/User.js";
import PG from "./models/PG.js";
import Visit from "./models/Visit.js";
import Lead from "./models/Lead.js";
import PaidLead from "./models/PaidLead.js";
import Institute from "./models/Institute.js";
import Referral from "./models/Referral.js";

const app = express();

// Allowed browser origins. FRONTEND_URL (comma-separated) adds to this list at
// deploy time; the defaults cover production and local dev.
const ALLOWED_ORIGINS = [
  "https://www.heystay.info",
  "https://heystay.info",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL?.split(",").map(o => o.trim()).filter(Boolean) ?? []),
];

app.use(cors({
  origin(origin, callback) {
    // Requests with no Origin (curl, server-to-server, health checks) are allowed.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.use("/api/pgs", pgRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/institutes", instituteRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Error handler — turns multer/upload failures (bad format, too large, too many
// files) into clean JSON instead of a default HTML response that rejects the
// whole request silently.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("API error:", err.message);
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Force-create collections so they appear in Atlas immediately
    await User.createCollection();
    await PG.createCollection();
    await Visit.createCollection();
    await Lead.createCollection();
    await PaidLead.createCollection();
    await Institute.createCollection();
    await Referral.createCollection();
    console.log("Collections ready: users, pgs, visits, leads, paidleads, institutes, referrals");

    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
