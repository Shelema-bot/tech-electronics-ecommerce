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

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", getProducts);

// GET PRODUCTS BY CATEGORY
router.get("/category/:categoryName", getProductsByCategory);

// GET SINGLE PRODUCT
router.get("/:id", getProductById);

// CREATE PRODUCT (ADMIN)
router.post("/", protect, admin, upload.array("images", 5), createProduct);

// UPDATE PRODUCT (ADMIN)
router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);

// DELETE PRODUCT (ADMIN)
router.delete("/:id", protect, admin, deleteProduct);

export default router;