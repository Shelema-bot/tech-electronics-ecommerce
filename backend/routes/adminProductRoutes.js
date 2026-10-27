import express from "express";
import protect from "../middleware/authMiddleware.js";
import { inventoryManagerOnly, superAdminOnly } from "../middleware/roleMiddleware.js";

import {
  createProduct,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct
} from "../controllers/adminProductController.js";

const router = express.Router();

router.post("/",   protect, inventoryManagerOnly, createProduct);
router.get("/",    protect, inventoryManagerOnly, getAllProductsAdmin);
router.put("/:id", protect, inventoryManagerOnly, updateProduct);
router.delete("/:id", protect, inventoryManagerOnly, deleteProduct);

export default router;
