import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Transaction from "../models/Transaction.model.js"
import Goal from "../models/Goal.model.js"
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (userId) => {
    return jwt.sign(
        { user: userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { user: userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '70d' }
    );
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }
        const user = await User.create({
            name,
            email,
            password
        });
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        res.status(201).json({
            success: true,
            accessToken,
            refreshToken,
            user
        });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: err.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }
        let user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }
        if (!user.password || typeof user.password !== 'string') {
            return res.status(500).json({
                success: false,
                error: "User password not properly set"
            });
        }
        const isMatch = await user.correctPassword(password);
        user = await User.findOne({ email });
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: err.message
        });
    }
};
export const getMe = async (req, res) => {
    res.status(200).json(req.user);
};
export const updateNetWorth = async (req, res) => {
    try {
        const { netWorth } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { netWorth },
            { new: true }
        );
        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                netWorth: updatedUser.netWorth
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
export const deleteUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No user token provided"
            });
        }
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        await Promise.all([
            User.findByIdAndDelete(userId),
            Transaction.deleteMany({ user: userId }),
            Goal.deleteMany({ user: userId }),
        ]);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({
            success: true,
            message: "User account and all associated data deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while deleting user",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ success: false, error: "Refresh token required" });
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
        const newAccessToken = generateAccessToken(decoded.user);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (err) {
        res.status(403).json({ success: false, error: "Invalid refresh token" });
    }
};