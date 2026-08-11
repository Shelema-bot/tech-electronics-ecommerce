import express from "express";
import {
forgotPassword,
resetPassword
}
from "../controllers/authController.js";
import {
    registerUser,
    loginUser
} from "../controllers/authController.js";


const router = express.Router();


router.post(
    "/register",
    registerUser
);


router.post(
    "/login",
    loginUser
);
router.post(
"/forgot-password",
forgotPassword
);


router.post(
"/reset-password",
resetPassword
);


export default router;