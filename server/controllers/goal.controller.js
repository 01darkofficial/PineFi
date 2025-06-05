import Goal from '../models/Goal.model.js';

export const createGoal = async (req, res) => {
    try {
        const goal = await Goal.create({
            user: req.user.id,
            ...req.body
        });
        res.status(200).json({
            status: 'success',
            data: { goal }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort("-createdAt");
        res.status(201).json({
            status: 'success',
            result: goals.length,
            data: { goals }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: `Failed to fetch goals`,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            id: req.params.id,
            user: req.user.id
        });
        if (!goal) {
            return res.status(400).json({
                status: "fail",
                message: "Goal not found or not authorized"
            })
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: "Failed to delete goal",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const updateGoal = async (req, res) => {
    try {
        const { amount } = req.body;
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        goal.saved += parseFloat(amount);
        const updatedGoal = await goal.save();
        res.json({
            success: true,
            data: updatedGoal,
            message: 'Funds added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}