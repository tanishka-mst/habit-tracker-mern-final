import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  registerUser,
  loginUser,
  getProfile,
  getSecurityQuestion,
  resetWithAnswer,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register",               registerUser);
router.post("/login",                  loginUser);
router.get("/profile", authMiddleware, getProfile);
router.post("/get-security-question",  getSecurityQuestion);
router.post("/reset-with-answer",      resetWithAnswer);

export default router;
