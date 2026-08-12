// server.js
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

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
dotenv.config();

// Check environment variables
console.log("JWT SECRET:", process.env.JWT_SECRET ? "Loaded ✅" : "Missing ❌");
console.log("Mongo URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");
console.log(
  "Chapa Key:",
  process.env.CHAPA_SECRET_KEY ? "Loaded ✅" : "Missing ❌"
);

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database

// =========================
// ROUTES
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);

// ---------- ADMIN ROUTES ----------

app.use("/api/admin", adminRoutes);

app.use("/api/admin/products", adminProductRoutes);

app.use("/api/admin/orders", adminOrderRoutes);

// FIXED ROUTE
app.use("/api/admin/users", adminUserRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/admin/payments", adminPaymentRoutes);

app.use("/api/admin/reports", adminReportRoutes);

// Static uploads
app.use("/uploads", express.static("uploads"));

// Default route
app.get("/", (req, res) => {
  res.send("E-Commerce API is running 🚀");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});


// Server Port
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();