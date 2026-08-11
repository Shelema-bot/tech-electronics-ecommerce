import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {
    getAllPaymentsAdmin,
    updatePaymentStatus,
    deletePaymentAdmin
} from "../controllers/adminPaymentController.js";


const router = express.Router();


// =================================
// GET ALL PAYMENTS
// =================================

router.get(
    "/",
    protect,
    admin,
    getAllPaymentsAdmin
);


// =================================
// UPDATE PAYMENT STATUS
// =================================

router.put(
    "/:id",
    protect,
    admin,
    updatePaymentStatus
);


// =================================
// DELETE PAYMENT
// =================================

router.delete(
    "/:id",
    protect,
    admin,
    deletePaymentAdmin
);


export default router;