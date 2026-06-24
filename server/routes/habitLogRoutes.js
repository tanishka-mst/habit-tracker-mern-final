import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  markHabitComplete,
  getHabitLogs,getHabitStreak,getLongestStreak,
} from "../controllers/habitLogController.js";

const router = express.Router();

router.post(
  "/:habitId/complete",
  authMiddleware,
  markHabitComplete
);

router.get(
  "/",
  authMiddleware,
  getHabitLogs
);

router.get(
  "/streak/:habitId",
  authMiddleware,
  getHabitStreak
);

router.get(
  "/longest-streak/:habitId",
  authMiddleware,
  getLongestStreak
);

export default router;