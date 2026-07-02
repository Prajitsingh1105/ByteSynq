const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendAlertEmail } = require('../utils/emailService');

const generateToken = (id) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await Otp.deleteMany({ email }); // Clear previous OTPs for this email
        await Otp.create({ email, otp });

        const emailSent = await sendAlertEmail(
            email, 
            'Your ByteSynq Verification Code', 
            `Your verification code is: ${otp}. It will expire in 10 minutes.`
        );

        if (emailSent) {
            res.status(200).json({ success: true, message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ success: false, error: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

const registerUser = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        if (!email || !password || !otp) {
            return res.status(400).json({ success: false, error: 'Please include all fields including OTP' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Verify OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        const user = await User.create({
            email,
            password
        });

        if (user) {
            await Otp.deleteMany({ email }); // Cleanup
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
    getMe,
    sendOtp
};
