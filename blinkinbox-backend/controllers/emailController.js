// controllers/emailController.js - Email controller
const Email = require('../models/email');
const User = require('../models/user');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

module.exports = {
  // Create a new email address
  async createEmail(req, res) {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      // Validate username format
      if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
        return res.status(400).json({ error: 'Invalid username format. Only letters, numbers, dots, underscores, and hyphens are allowed.' });
      }
      
      // Check if username is used by a premium user
      const isPremiumUser = await User.findOne({ 
        email: `${username}@${process.env.DOMAIN}`,
        isPremium: true,
        premiumUntil: { $gt: new Date() }
      });
      
      if (isPremiumUser) {
        return res.status(409).json({ error: 'This email address is already in use by a premium user' });
      }
      
      return res.json({ 
        success: true, 
        username,
        email: `${username}@${process.env.DOMAIN}`
      });
    } catch (error) {
      logger.error('Create email error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Get emails for a username
  async getEmails(req, res) {
    try {
      const { username } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // Check if user is premium to determine retention period
      let isPremium = false;
      if (req.user) {
        const user = await User.findById(req.user.id);
        isPremium = user && user.isPremiumActive();
      }
      
      const emails = await Email.find({ username })
        .sort({ receivedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-attachments.content'); // Don't send attachment content in list view
      
      const total = await Email.countDocuments({ username });
      
      // Format emails for the frontend
      const formattedEmails = emails.map(email => ({
        id: email._id,
        sender: email.senderName ? `${email.senderName} <${email.sender}>` : email.sender,
        subject: email.subject,
        preview: email.text ? email.text.substring(0, 100) : 'No content',
        receivedAt: email.receivedAt,
        time: formatEmailTime(email.receivedAt),
        read: email.read,
        starred: email.starred,
        hasAttachments: email.attachments && email.attachments.length > 0,
        attachmentsCount: email.attachments ? email.attachments.length : 0
      }));
      
      return res.json({
        emails: formattedEmails,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        totalEmails: total,
        isPremium
      });
    } catch (error) {
      logger.error('Get emails error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Get email details
  async getEmailDetails(req, res) {
    try {
      const { username, emailId } = req.params;
      
      const email = await Email.findOne({ 
        _id: emailId,
        username
      });
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      // Mark as read if it wasn't already
      if (!email.read) {
        email.read = true;
        await email.save();
      }
      
      // Format attachments for the frontend
      const formattedAttachments = email.attachments.map(attachment => ({
        id: attachment._id,
        filename: attachment.filename,
        contentType: attachment.contentType,
        size: attachment.content ? attachment.content.length : 0
      }));
      
      return res.json({
        id: email._id,
        sender: email.senderName ? `${email.senderName} <${email.sender}>` : email.sender,
        subject: email.subject,
        html: email.html,
        text: email.text,
        receivedAt: email.receivedAt,
        read: email.read,
        starred: email.starred,
        attachments: formattedAttachments
      });
    } catch (error) {
      logger.error('Get email details error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Delete an email
  async deleteEmail(req, res) {
    try {
      const { username, emailId } = req.params;
      
      // Verify ownership if user is authenticated
      if (req.user) {
        const user = await User.findById(req.user.id);
        if (user && user.email.split('@')[0] !== username) {
          return res.status(403).json({ error: 'Not authorized' });
        }
      }
      
      const result = await Email.deleteOne({ 
        _id: emailId,
        username
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      return res.json({ success: true });
    } catch (error) {
      logger.error('Delete email error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Star/unstar an email
  async starEmail(req, res) {
    try {
      const { username, emailId } = req.params;
      const { starred } = req.body;
      
      // Verify ownership
      if (req.user.email.split('@')[0] !== username) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      const email = await Email.findOne({ 
        _id: emailId,
        username
      });
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      email.starred = !!starred;
      await email.save();
      
      return res.json({ success: true, starred: email.starred });
    } catch (error) {
      logger.error('Star email error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Mark email as read/unread
  async markAsRead(req, res) {
    try {
      const { username, emailId } = req.params;
      const { read } = req.body;
      
      // Verify ownership
      if (req.user.email.split('@')[0] !== username) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      const email = await Email.findOne({ 
        _id: emailId,
        username
      });
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      email.read = !!read;
      await email.save();
      
      return res.json({ success: true, read: email.read });
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
  
  // Forward an email
  async forwardEmail(req, res) {
    try {
      const { username, emailId } = req.params;
      const { destination } = req.body;
      
      // Verify ownership
      if (req.user.email.split('@')[0] !== username) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      // Validate destination email
      if (!destination || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) {
        return res.status(400).json({ error: 'Valid destination email is required' });
      }
      
      const email = await Email.findOne({ 
        _id: emailId,
        username
      });
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      // Forward the email
      await emailService.forwardEmail(email, destination);
      
      return res.json({ success: true });
    } catch (error) {
      logger.error('Forward email error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

// Format email time for display
function formatEmailTime(date) {
  const now = new Date();
  const diff = now - date;
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} min ago`;
  }
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Within a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
  
  // Older
  return date.toLocaleDateString();
}