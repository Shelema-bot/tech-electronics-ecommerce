// ──────────────────────────────────────────────────────────────
// server.js — Tech & Electronic E-Commerce Backend
// Architecture: Alibaba-inspired modular MERN
// ──────────────────────────────────────────────────────────────

// dotenv MUST be loaded before any other imports that use env vars
import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors    from "cors";

// ── Config ─────────────────────────────────────────────────────
import connectDB  from "./config/db.js";
import corsOptions from "./config/cors.js";

// ── Utils / Middleware ──────────────────────────────────────────
import logger       from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import { authRateLimit, paymentRateLimit } from "./middleware/rateLimit.middleware.js";

// ── Customer Routes ─────────────────────────────────────────────
import authRoutes     from "./routes/authRoutes.js";
import productRoutes  from "./routes/productRoutes.js";
import orderRoutes    from "./routes/orderRoutes.js";
import paymentRoutes  from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes     from "./routes/userRoutes.js";
import reviewRoutes   from "./routes/reviewRoutes.js";
import contactRoutes  from "./routes/contactRoutes.js";
import staffRoutes    from "./routes/staffRoutes.js";

// ── Admin Routes ────────────────────────────────────────────────
import adminRoutes          from "./routes/adminRoutes.js";
import adminProductRoutes   from "./routes/adminProductRoutes.js";
import adminOrderRoutes     from "./routes/adminOrderRoutes.js";
import adminUserRoutes      from "./routes/adminUserRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminPaymentRoutes   from "./routes/adminPaymentRoutes.js";
import adminReportRoutes    from "./routes/adminReportRoutes.js";

// ══════════════════════════════════════════════════════════════
// STARTUP ENVIRONMENT CHECK
// (values are checked, NEVER logged)
// ══════════════════════════════════════════════════════════════
const requiredEnv = ["JWT_SECRET", "MONGO_URI", "CHAPA_SECRET_KEY", "CLOUDINARY_CLOUD_NAME"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    logger.warn(`Environment variable missing: ${key}`);
  } else {
    logger.info(`${key}: loaded ✅`);
  }
});

// ══════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════
const app = express();

// ── Security / Parsing ──────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Request logger (dev) ────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ══════════════════════════════════════════════════════════════
// CUSTOMER ROUTES
// ══════════════════════════════════════════════════════════════
app.use("/api/auth",       authRateLimit,    authRoutes);
app.use("/api/products",                     productRoutes);
app.use("/api/orders",                       orderRoutes);
app.use("/api/payments",   paymentRateLimit, paymentRoutes);
app.use("/api/categories",                   categoryRoutes);
app.use("/api/users",                        userRoutes);
app.use("/api/reviews",                      reviewRoutes);
app.use("/api/contact",                      contactRoutes);
app.use("/api/staff",                        staffRoutes);

// ══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════════════════════════
app.use("/api/admin",              adminRoutes);
app.use("/api/admin/products",     adminProductRoutes);
app.use("/api/admin/orders",       adminOrderRoutes);
app.use("/api/admin/users",        adminUserRoutes);
app.use("/api/admin/dashboard",    adminDashboardRoutes);
app.use("/api/admin/payments",     adminPaymentRoutes);
app.use("/api/admin/reports",      adminReportRoutes);

// ── Static uploads ──────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── Health check ────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Tech & Electronic E-Commerce API is running 🚀",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ── 404 handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// ── Centralized error handler (MUST be last) ────────────────────
app.use(errorHandler);

// ══════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  } catch (error) {
    logger.error("Failed to start server", error.message);
    process.exit(1);
  }
};

startServer();
