import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Goal name is required'],
        trim: true,
        maxlength: [50, 'Goal name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    saved: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Saved amount cannot be negative']
    },
    target: {
        type: Number,
        required: [true, 'Target amount is required'],
        min: [1, 'Target amount must be at least 1']
    },
    status: {
        type: String,
        enum: ['Active', 'Achieved', 'Archived'],
        default: 'Active'
    },
    targetDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return !value || value > new Date();
            },
            message: 'Target date must be in the future'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
goalSchema.pre('save', function (next) {
    if (this.saved >= this.target) {
        this.status = 'Achieved';
    }
    this.updatedAt = new Date();
    next();
});
const Goal = mongoose.model('Goal', goalSchema);
export default Goal;