// routes/userRoutes.js - User-related routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Protected routes
router.get('/me', authenticate, userController.getCurrentUser);
router.put('/me', authenticate, userController.updateUser);
router.put('/forwarding', authenticate, userController.updateForwardingSettings);
router.post('/premium/upgrade', authenticate, userController.upgradeToPremium);
router.get('/premium/status', authenticate, userController.getPremiumStatus);

// Admin routes
router.get('/', adminOnly, userController.getAllUsers);
router.get('/:userId', adminOnly, userController.getUserById);
router.put('/:userId/premium', adminOnly, userController.updatePremiumStatus);

module.exports = router;