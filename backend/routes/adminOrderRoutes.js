import express from "express";
import protect from "../middleware/authMiddleware.js";
import { cashierFinanceOnly, superAdminOnly, orderFulfillmentAccess } from "../middleware/roleMiddleware.js";

import {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatus,
  deleteOrderAdmin
} from "../controllers/adminOrderController.js";

const router = express.Router();

router.get("/",            protect, orderFulfillmentAccess, getAllOrdersAdmin);
router.get("/:id",         protect, orderFulfillmentAccess, getOrderByIdAdmin);
router.put("/:id/status",  protect, orderFulfillmentAccess, updateOrderStatus);
router.delete("/:id",      protect, superAdminOnly,          deleteOrderAdmin);

export default router;
