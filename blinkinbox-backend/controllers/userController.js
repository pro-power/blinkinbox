// controllers/userController.js - User controller
const User = require('../models/user');
const logger = require('../utils/logger');
const stripe = require('../services/stripeService');

module.exports = {
  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-apiKey');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({
        email: user.email,
        isPremium: user.isPremiumActive(),
        premiumUntil: user.premiumUntil,
        forwardingEmail: user.forwardingEmail,
        forwardingKeywords: user.forwardingKeywords,
        createdAt: user.createdAt
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Update user
  async updateUser(req, res) {
    try {
      const { forwardingEmail } = req.body;
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update forwarding email if provided
      if (forwardingEmail !== undefined) {
        if (forwardingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardingEmail)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        user.forwardingEmail = forwardingEmail || null;
      }
      
      await user.save();
      
      return res.json({
        success: true,
        email: user.email,
        forwardingEmail: user.forwardingEmail
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Update forwarding settings
  async updateForwardingSettings(req, res) {
    try {
      const { forwardingEmail, forwardingKeywords } = req.body;
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user is premium
      if (!user.isPremiumActive()) {
        return res.status(403).json({ error: 'Premium subscription required for email forwarding' });
      }
      
      // Update forwarding email if provided
      if (forwardingEmail !== undefined) {
        if (forwardingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forwardingEmail)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        user.forwardingEmail = forwardingEmail || null;
      }
      
      // Update forwarding keywords if provided
      if (forwardingKeywords !== undefined) {
        if (!Array.isArray(forwardingKeywords)) {
          return res.status(400).json({ error: 'Forwarding keywords must be an array' });
        }
        
        // Filter out empty strings and trim each keyword
        user.forwardingKeywords = forwardingKeywords
          .map(keyword => keyword.trim())
          .filter(keyword => keyword.length > 0);
      }
      
      await user.save();
      
      return res.json({
        success: true,
        forwardingEmail: user.forwardingEmail,
        forwardingKeywords: user.forwardingKeywords
      });
    } catch (error) {
      logger.error('Update forwarding settings error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Upgrade to premium
  async upgradeToPremium(req, res) {
    try {
      const { paymentMethodId } = req.body;
      
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Already premium?
      if (user.isPremiumActive()) {
        return res.status(400).json({ error: 'User already has an active premium subscription' });
      }
      
      // Process payment with Stripe
      const paymentResult = await stripe.processSubscription(user.email, paymentMethodId);
      
      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.error });
      }
      
      // Update user
      user.isPremium = true;
      user.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();
      
      return res.json({
        success: true,
        isPremium: true,
        premiumUntil: user.premiumUntil
      });
    } catch (error) {
      logger.error('Upgrade to premium error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Get premium status
  async getPremiumStatus(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const isPremium = user.isPremiumActive();
      
      return res.json({
        isPremium,
        premiumUntil: user.premiumUntil
      });
    } catch (error) {
      logger.error('Get premium status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Admin: Get all users
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      
      let query = {};
      
      if (search) {
        query.email = { $regex: search, $options: 'i' };
      }
      
      const users = await User.find(query)
        .select('-apiKey')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      
      const total = await User.countDocuments(query);
      
      return res.json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        totalUsers: total
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Admin: Get user by ID
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId).select('-apiKey');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json(user);
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Admin: Update premium status
  async updatePremiumStatus(req, res) {
    try {
      const { userId } = req.params;
      const { isPremium, premiumDays } = req.body;
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      user.isPremium = !!isPremium;
      
      if (isPremium && premiumDays) {
        user.premiumUntil = new Date(Date.now() + premiumDays * 24 * 60 * 60 * 1000);
      } else if (!isPremium) {
        user.premiumUntil = null;
      }
      
      await user.save();
      
      return res.json({
        success: true,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil
      });
    } catch (error) {
      logger.error('Update premium status error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};