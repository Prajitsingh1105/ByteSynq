const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ success: false, error: 'Not authorized, token missing or malformed' });
            }

            // Verify token
            const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};

module.exports = { protect };
