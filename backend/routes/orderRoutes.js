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




// ===============================
// CUSTOMER ROUTES
// ===============================


// Create order
router.post(
    "/",
    protect,
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