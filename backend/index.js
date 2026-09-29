import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import cors from "cors";
import { connectDB } from "./backend/config/db.js";
import { autoSeedIfEmpty, getOrders } from "./backend/services/dbService.js";
import apiRoutes from "./backend/routes/apiRoutes.js";
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5e3;
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || true,
      credentials: true
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));
  await connectDB();
  await autoSeedIfEmpty();
  app.use("/api", apiRoutes);
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "Smart Restaurant API is running." });
  });
  // Kitchen flow timer: walks every live order forward one stage every few
  // minutes (Pending -> Confirmed -> Preparing -> Ready -> Served) even when
  // nobody is looking at the tracker. getOrders() applies the progression.
  if (String(process.env.AUTO_ORDER_FLOW || "on").toLowerCase() !== "off") {
    setInterval(() => {
      getOrders().catch((e) => console.warn("Auto order flow tick failed:", e?.message || e));
    }, 30 * 1000);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Smart Restaurant Backend API running on http://0.0.0.0:${PORT}`);
    console.log(`   REST endpoints available under /api`);
  });
}
startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
});
