import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import pgRoutes from "./routes/pg.js";
import userRoutes from "./routes/user.js";
import User from "./models/User.js";
import PG from "./models/PG.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/api/pgs", pgRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Force-create collections so they appear in Atlas immediately
    await User.createCollection();
    await PG.createCollection();
    console.log("Collections ready: users, pgs");

    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
