import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 chars']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 chars'],
        select: false
    },
    netWorth: {
        type: String,
        default: "0"
    },
    income: {
        type: String,
        default: "0",
    },
    defaultCategories: {
        type: [String],
        default: ['Food', 'Rent', 'Transport', 'Entertainment', 'Salary']
    },
    setttings: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'light'
        },
        currency: {
            type: String,
            default: 'USD'
        },
        notifications: {
            transactionAlerts: { type: Boolean, default: true },
            budgetWarning: { type: Boolean, default: true },
            monthlyReports: { type: Boolean, default: false }
        },
        advancedSettings: {
            decimalPlaces: {
                type: String,
                enum: ['0', '1', '2'],
                default: "0",
            },
            startWeek: {
                type: String,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            }
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
userSchema.methods.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);