// routes/emailRoutes.js - Email-related routes
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Public routes
router.post('/', emailController.createEmail);
router.get('/:username', optionalAuth, emailController.getEmails);
router.get('/:username/:emailId', optionalAuth, emailController.getEmailDetails);

// Protected routes
router.delete('/:username/:emailId', authenticate, emailController.deleteEmail);
router.put('/:username/:emailId/star', authenticate, emailController.starEmail);
router.put('/:username/:emailId/read', authenticate, emailController.markAsRead);
router.post('/:username/:emailId/forward', authenticate, emailController.forwardEmail);

module.exports = router;