import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createHabit,getHabits,updateHabit,

  deleteHabit, archiveHabit,completeHabit,} from "../controllers/habitController.js";

  

const router = express.Router();

router.post("/", authMiddleware, createHabit);
router.get("/", authMiddleware, getHabits);
router.put("/:id", authMiddleware, updateHabit);
router.delete("/:id", authMiddleware, deleteHabit);
router.put("/archive/:id", authMiddleware, archiveHabit);

router.patch(
  "/:id/complete",
  authMiddleware,
  completeHabit
);



export default router;