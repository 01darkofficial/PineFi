
import Budget from '../models/Budget.model.js';

// Create budget
export const createBudget = async (req, res) => {
    try {
        const budget = await Budget.create({
            user: req.user.id,
            ...req.body
        });
        console.log(budget);

        res.status(200).json({
            status: 'success',
            data: { budget }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get goals
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id }).sort("-createdAt");
        console.log(budgets);
        res.status(201).json({
            status: 'success',
            result: budgets.length,
            data: { budgets }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: `Failed to fetch budgets`,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Delete budget
export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            id: req.params.id,
            user: req.user.id
        });
        if (!budget) {
            return res.status(400).json({
                status: "fail",
                message: "Budget not found or not authorized"
            })
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: "Failed to delete budget",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};