import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
    createTransaction,
    getTransactions,
    deleteTransaction
} from '../controllers/transaction.controller.js';

const router = express.Router();

router.get("/", protect, getTransactions);
router.post("/", protect, createTransaction);
router.delete("/:id", protect, deleteTransaction);

export default router;