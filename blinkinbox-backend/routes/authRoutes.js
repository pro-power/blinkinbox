// routes/authRoutes.js - Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.requestPasswordReset);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/api-key', authController.generateApiKey);

module.exports = router;