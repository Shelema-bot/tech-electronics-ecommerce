import express from "express";

import {
    getProductReviews,
    createReview
} from "../controllers/reviewController.js";

import {protect} from "../middleware/authMiddleware.js";


const router = express.Router();



router.get(
    "/:id",
    getProductReviews
);



router.post(
    "/:id",
    protect,
    createReview
);



export default router;