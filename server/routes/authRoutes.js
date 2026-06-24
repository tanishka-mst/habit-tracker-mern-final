import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  registerUser,
  loginUser,
  getProfile,forgotPassword,resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.post(
  "/forgot-password",
  forgotPassword
);
router.post(
  "/reset-password/:token",
  resetPassword
);

export default router;