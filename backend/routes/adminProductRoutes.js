import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {
  createProduct,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct
} from "../controllers/adminProductController.js";


const router = express.Router();


router.post(
  "/",
  protect,
  admin,
  createProduct
);


router.get(
  "/",
  protect,
  admin,
  getAllProductsAdmin
);


router.put(
  "/:id",
  protect,
  admin,
  updateProduct
);


router.delete(
  "/:id",
  protect,
  admin,
  deleteProduct
);


export default router;