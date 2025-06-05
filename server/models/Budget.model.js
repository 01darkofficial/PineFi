import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Budget must belong to a user']
    },
    name: {
        type: String,
        required: [true, 'Budget name is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['FOOD', 'TRANSPORT', 'HOUSING', 'ENTERTAINMENT', 'HEALTH'],
        trim: true
    },
    limit: {
        type: Number,
        required: [true, 'Limit is required'],
        min: [0.01, 'Limit must be positive']
    },
    period: {
        type: String,
        enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
        default: 'WEEKLY',
        uppercase: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Prevent duplicate budgets for same category/period
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);