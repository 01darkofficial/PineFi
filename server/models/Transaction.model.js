import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must belong to a user']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be at least 0.01']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'BILLS', 'SALARY', 'PERSONAL', 'GOALS'],
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['INCOME', 'EXPENSE', 'SAVINGS'],
        uppercase: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        maxlength: [200, 'Description too long'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Other'],
        default: 'Cash'
    },
    isRecurring: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Transaction', transactionSchema);