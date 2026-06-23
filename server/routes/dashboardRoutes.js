import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getWeeklyAnalytics,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", authMiddleware, getDashboardStats);

router.get("/weekly", authMiddleware, getWeeklyAnalytics);

export default router;