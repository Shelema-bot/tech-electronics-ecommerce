import express from "express";

import {
    getProducts,
    getProductsByCategory,
    getProductById,
    createProduct
} from "../controllers/productController.js";

import {
    updateProduct,
    deleteProduct
} from "../controllers/adminProductController.js";

import { searchByImage } from "../controllers/imageSearchController.js";

import protect from "../middleware/authMiddleware.js";
import admin   from "../middleware/adminMiddleware.js";
import upload  from "../middleware/uploadMiddleware.js";

// Memory-only storage for image-search uploads (no cloud persistence needed)
import multer  from "multer";
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────
router.get("/",                       getProducts);
router.get("/category/:categoryName", getProductsByCategory);

// ── Image search (public — no auth needed) ───────────────────
router.post("/search-by-image", memUpload.single("image"), searchByImage);

// ── Single product ───────────────────────────────────────────
router.get("/:id", getProductById);

// ── Admin product management ─────────────────────────────────
router.post("/",    protect, admin, upload.array("images", 5), createProduct);
router.put("/:id",  protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;