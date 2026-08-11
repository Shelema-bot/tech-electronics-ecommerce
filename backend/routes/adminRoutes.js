import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";


const router = express.Router();


// Test admin access

router.get(
"/",
protect,
admin,
(req,res)=>{

res.json({

success:true,

message:"Welcome Admin"

});

});


export default router;