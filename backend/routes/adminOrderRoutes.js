import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";


import {
getAllOrdersAdmin,
getOrderByIdAdmin,
updateOrderStatus,
deleteOrderAdmin

} from "../controllers/adminOrderController.js";


const router = express.Router();



router.get(
"/",
protect,
admin,
getAllOrdersAdmin
);



router.get(
"/:id",
protect,
admin,
getOrderByIdAdmin
);



router.put(
"/:id/status",
protect,
admin,
updateOrderStatus
);



router.delete(
"/:id",
protect,
admin,
deleteOrderAdmin
);



export default router;