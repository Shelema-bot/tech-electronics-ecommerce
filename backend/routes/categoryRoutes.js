import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


// CREATE CATEGORY ADMIN
router.post(
 "/",
 protect,
 admin,
 upload.single("image"),
 createCategory
);


// GET ALL CATEGORIES
router.get(
  "/",
  getCategories
);


// GET SINGLE CATEGORY
router.get(
  "/:id",
  protect,
  admin,
  getCategory
);


// UPDATE CATEGORY ADMIN
router.put(
  "/:id",
  protect,
  admin,
  updateCategory
);


// DELETE CATEGORY ADMIN
router.delete(
  "/:id",
  protect,
  admin,
  deleteCategory
);


export default router;