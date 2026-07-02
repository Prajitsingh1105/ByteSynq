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

const getOtpEmailTemplate = (otp, isReset) => {
    const title = isReset ? 'Reset your password' : 'Verify your email address';
    const message = isReset ? 'Enter the following code to reset your ByteSynq password.' : 'Enter the following secure code to verify your new ByteSynq account.';
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #e2e8f0; text-align: center; min-height: 100vh;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h1 style="color: #10b981; font-size: 28px; margin-bottom: 10px; font-weight: 800; letter-spacing: -1px;">ByteSynq</h1>
        <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px; font-weight: 600;">${title}</h2>
        <p style="color: #94a3b8; font-size: 15px; margin-bottom: 30px; line-height: 1.6;">${message} This code is highly confidential and will expire in exactly 10 minutes.</p>
        <div style="background-color: #020617; border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 24px; font-size: 36px; font-weight: 700; color: #10b981; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace; box-shadow: inset 0 0 20px rgba(16,185,129,0.05);">${otp}</div>
        <div style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If you didn't request this code, your account is still secure. You can safely ignore this email.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 10px;">&copy; ${new Date().getFullYear()} ByteSynq Labs. All rights reserved.</p>
        </div>
      </div>
    </div>
    `;
};

const sendOtp = async (req, res) => {
    try {
        const { email, isReset } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

        const userExists = await User.findOne({ email });
        
        if (isReset && !userExists) {
            // Security best practice: Don't reveal if account exists during password reset
            return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent.' });
        }

        if (!isReset && userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await Otp.deleteMany({ email }); // Clear previous OTPs for this email
        await Otp.create({ email, otp });

        const htmlContent = getOtpEmailTemplate(otp, isReset);
        const textContent = `Your ByteSynq verification code is: ${otp}. It will expire in 10 minutes.`;

        const emailSent = await sendAlertEmail(
            email, 
            isReset ? 'Reset your ByteSynq password' : 'Your ByteSynq Verification Code', 
            textContent,
            htmlContent
        );

        if (emailSent || isReset) {
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

        // Strict password complexity check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' });
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

const resetPassword = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        if (!email || !password || !otp) {
            return res.status(400).json({ success: false, error: 'Please include all fields' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.' });
        }

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.password = password; // Will be hashed by pre-save hook
        await user.save();
        await Otp.deleteMany({ email }); // Cleanup

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                token: generateToken(user._id)
            }
        });
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
    sendOtp,
    resetPassword
};
