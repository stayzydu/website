import { verifyToken } from "@clerk/backend";
import User from "../models/User.js";

const SECRET = process.env.CLERK_SECRET_KEY;

async function getClerkId(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("No token");
  const { sub } = await verifyToken(token, { secretKey: SECRET });
  return sub;
}

export async function requireClerkToken(req, res, next) {
  console.log("[requireClerkToken] Checking token...");
  try {
    const clerkId = await getClerkId(req);
    console.log("[requireClerkToken] Token valid, clerkId =", clerkId);
    req.clerkId = clerkId;
    next();
  } catch (err) {
    console.error("[requireClerkToken] Failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function requireAuth(req, res, next) {
  try {
    const clerkId = await getClerkId(req);
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(401).json({ error: "User not found in DB" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  });
}
