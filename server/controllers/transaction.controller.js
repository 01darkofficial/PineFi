import Transaction from '../models/Transaction.model.js';

export const createTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create({
            user: req.user.id,
            ...req.body
        });
        console.log(transaction);

        res.status(200).json({
            status: 'success',
            data: { transaction }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort("-createdAt");
        console.log(transactions);
        res.status(201).json({
            status: 'success',
            result: transactions.length,
            data: { transactions }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: `Failed to fetch transaction`,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            id: req.params.id,
            user: req.user.id
        });
        if (!transaction) {
            return res.status(400).json({
                status: "fail",
                message: "Transaction not found or not authorized"
            })
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: "Failed to delete transaction",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};