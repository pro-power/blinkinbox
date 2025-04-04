// controllers/authController.js - Authentication controller
const User = require('../models/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

module.exports = {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const newUser = new User({
        email,
        password: hashedPassword
      });
      
      // Save user
      await newUser.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          isPremium: false
        }
      });
    } catch (error) {
      logger.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find the user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          isPremium: user.isPremiumActive()
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that the user doesn't exist
        return res.json({ success: true, message: 'If your email exists in our system, you will receive a password reset link.' });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash the token and save to user
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
      
      // Send email with reset link
      await emailService.sendPasswordResetEmail(user.email, resetToken);
      
      return res.json({ success: true, message: 'If your email exists in our system, you will receive a password reset link.' });
    } catch (error) {
      logger.error('Request password reset error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Reset password with token
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'New password is required' });
      }
      
      // Hash the token from the URL
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find user with the token and check if expired
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      
      // Clear the reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();
      
      return res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Generate API key
  async generateApiKey(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find the user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate new API key
      user.apiKey = crypto.randomBytes(16).toString('hex');
      await user.save();
      
      return res.json({
        success: true,
        apiKey: user.apiKey
      });
    } catch (error) {
      logger.error('Generate API key error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};