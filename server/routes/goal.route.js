import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createGoal, getGoals, deleteGoal, updateGoal } from '../controllers/goal.controller.js';

const router = express.Router();

router.get("/", protect, getGoals);
router.post("/", protect, createGoal);
router.delete("/:id", protect, deleteGoal);
router.put("/:id/allocate", protect, updateGoal);

export default router;