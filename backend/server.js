// server.js — dotenv MUST be first before any other imports that use env vars
import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminPaymentRoutes from "./routes/adminPaymentRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// =========================
// CHECK ENVIRONMENT VARIABLES
// =========================
console.log("JWT SECRET:",        process.env.JWT_SECRET        ? "Loaded ✅" : "Missing ❌");
console.log("Mongo URI:",         process.env.MONGO_URI         ? "Loaded ✅" : "Missing ❌");
console.log("Chapa Key:",         process.env.CHAPA_SECRET_KEY  ? "Loaded ✅" : "Missing ❌");
console.log("Cloudinary Name:",   process.env.CLOUDINARY_CLOUD_NAME ? "Loaded ✅" : "Missing ❌");

// =========================
// INITIALIZE APP
// =========================
const app = express();

// =========================
// CORS
// =========================
const allowedOrigins = [
  "https://tech-electronics-ecommerce-frontend.onrender.com",
  "https://tech-electronics-ecommerce-frontend-git-main-tech-electronics.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// =========================
// BODY PARSER
// =========================
app.use(express.json());

// =========================
// ROUTES
// =========================
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/contact",  contactRoutes);

// Admin routes
app.use("/api/admin",            adminRoutes);
app.use("/api/admin/products",   adminProductRoutes);
app.use("/api/admin/orders",     adminOrderRoutes);
app.use("/api/admin/users",      adminUserRoutes);
app.use("/api/admin/dashboard",  adminDashboardRoutes);
app.use("/api/admin/payments",   adminPaymentRoutes);
app.use("/api/admin/reports",    adminReportRoutes);

// =========================
// STATIC UPLOADS
// =========================
app.use("/uploads", express.static("uploads"));

// =========================
// DEFAULT ROUTE
// =========================
app.get("/", (req, res) => res.send("E-Commerce API is running 🚀"));

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
