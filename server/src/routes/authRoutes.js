const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  changePasswordForce, 
  setup2FA, 
  toggle2FA, 
  verify2FA, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

// Hardened auth endpoints
router.post('/change-password-force', changePasswordForce);
router.post('/2fa/setup', authMiddleware, setup2FA);
router.post('/2fa/toggle', authMiddleware, toggle2FA);
router.post('/2fa/verify', verify2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
