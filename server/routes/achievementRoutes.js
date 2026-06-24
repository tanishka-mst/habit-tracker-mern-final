import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAchievements } from "../controllers/achievementController.js";

const router = express.Router();

router.get("/", authMiddleware, getAchievements);

export default router;