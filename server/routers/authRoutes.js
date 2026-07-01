const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/auth?error=oauth_failed' }),
  (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, {
        expiresIn: '30d'
    });
    res.redirect(`http://localhost:5173/auth?token=${token}`);
  }
);

module.exports = router;
