// models/email.js - Email model schema
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  contentDisposition: String,
  content: Buffer
});

const emailSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    index: true,
    lowercase: true
  },
  sender: { 
    type: String, 
    required: true 
  },
  senderName: {
    type: String,
    default: ''
  },
  subject: { 
    type: String, 
    default: '(No Subject)' 
  },
  text: String,
  html: String,
  receivedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  starred: {
    type: Boolean,
    default: false
  },
  attachments: [attachmentSchema]
});

// Create indexes for better performance
emailSchema.index({ username: 1, receivedAt: -1 });
emailSchema.index({ receivedAt: 1 });

module.exports = mongoose.model('Email', emailSchema);