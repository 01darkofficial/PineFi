import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createBudget, getBudgets ,deleteBudget } from '../controllers/budget.controller.js';

const router = express.Router();

router.get("/", protect, getBudgets);
router.post("/", protect, createBudget);
router.delete("/:id", protect, deleteBudget);

export default router;