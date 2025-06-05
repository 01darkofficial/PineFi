import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import User from '../models/User.model.js';

dotenv.config();

export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'Not authorized'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.user);
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token'
        });
    }
};