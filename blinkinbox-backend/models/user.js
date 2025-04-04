// models/user.js - User model for premium features
const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  premiumUntil: { 
    type: Date,
    default: null
  },
  forwardingEmail: {
    type: String,
    default: null
  },
  forwardingKeywords: [{
    type: String
  }],
  apiKey: {
    type: String,
    default: function() {
      return crypto.randomBytes(16).toString('hex');
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

// Method to check if user is premium
userSchema.methods.isPremiumActive = function() {
  if (!this.isPremium) return false;
  if (!this.premiumUntil) return false;
  return new Date() < this.premiumUntil;
};

module.exports = mongoose.model('User', userSchema);