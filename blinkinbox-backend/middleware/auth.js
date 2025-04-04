// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../utils/logger');

module.exports = {
  // Authenticate all requests
  async authenticate(req, res, next) {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  },
  
  // Optional authentication - proceed even if no token
  async optionalAuth(req, res, next) {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        // No token, but that's okay - continue without user
        return next();
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (user) {
        // Add user to request if found
        req.user = user;
      }
      
      next();
    } catch (error) {
      // Token error, but that's okay for optional auth - continue without user
      next();
    }
  },
  
  // Admin only middleware
  async adminOnly(req, res, next) {
    try {
      // First authenticate
      await module.exports.authenticate(req, res, () => {});
      
      // Check if user exists and is admin
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      next();
    } catch (error) {
      logger.error('Admin authentication error:', error);
      res.status(403).json({ error: 'Admin access required' });
    }
  }
};