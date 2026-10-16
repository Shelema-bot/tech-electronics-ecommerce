import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";


import {
    createOrder,
    getMyOrders,
    getOrderById,
    payOrder,
    deleteMyOrder
} from "../controllers/orderController.js";

import {
    getAllOrdersAdmin,
    updateOrderStatus,
    deleteOrderAdmin
} from "../controllers/adminOrderController.js";



const router = express.Router();




// Optional auth middleware for guest/customer order creation
const optionalProtect = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      if (token && token !== "null" && token !== "undefined" && token.trim()) {
        return protect(req, res, next);
      }
    }
    next();
  } catch (_err) {
    next();
  }
};

// ===============================
// CUSTOMER ROUTES
// ===============================

// Create order (supports authenticated users and guest checkout)
router.post(
    "/",
    optionalProtect,
    createOrder
);




// Get logged-in user orders
router.get(
    "/myorders",
    protect,
    getMyOrders
);



// Get single order
router.get(
    "/:id",
    protect,
    getOrderById
);




// Mark order as paid
router.put(
    "/:id/pay",
    protect,
    payOrder
);

// Remove customer's own order
router.delete(
    "/:id",
    protect,
    deleteMyOrder
);



// ===============================
// ADMIN ROUTES
// ===============================


// Get all orders
router.get(
    "/admin/orders",
    protect,
    admin,
    getAllOrdersAdmin
);



// Update order status
router.put(
    "/admin/orders/:id/status",
    protect,
    admin,
    updateOrderStatus
);



// Delete order
router.delete(
    "/admin/orders/:id",
    protect,
    admin,
    deleteOrderAdmin
);



export default router;