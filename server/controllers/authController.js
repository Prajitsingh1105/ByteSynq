const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please include all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    email: user.email,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400).json({ success: false, error: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                success: true,
                user: {
                    _id: user._id,
                    email: user.email,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                email: req.user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};
