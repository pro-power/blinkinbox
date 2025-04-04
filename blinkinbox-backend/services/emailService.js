// services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = {
  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      const message = {
        from: `BlinkInbox <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset. Please use the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #6366F1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link is valid for 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };
      
      await transporter.sendMail(message);
      logger.info(`Password reset email sent to ${email}`);
      
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  },
  
  // Forward an email to another address
  async forwardEmail(email, destination) {
    try {
      const message = {
        from: `${email.sender} via BlinkInbox <${process.env.EMAIL_FROM}>`,
        to: destination,
        subject: `Fwd: ${email.subject}`,
        html: `
          <p>---------- Forwarded message ---------</p>
          <p>From: ${email.sender}</p>
          <p>Date: ${new Date(email.receivedAt).toLocaleString()}</p>
          <p>Subject: ${email.subject}</p>
          <p>----------</p>
          ${email.html || `<pre>${email.text}</pre>`}
        `,
        text: email.text ? 
          `---------- Forwarded message ---------\nFrom: ${email.sender}\nDate: ${new Date(email.receivedAt).toLocaleString()}\nSubject: ${email.subject}\n----------\n\n${email.text}` : 
          undefined,
      };
      
      // Add attachments if any
      if (email.attachments && email.attachments.length > 0) {
        message.attachments = email.attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType
        }));
      }
      
      await transporter.sendMail(message);
      logger.info(`Email forwarded to ${destination}`);
      
      return true;
    } catch (error) {
      logger.error('Error forwarding email:', error);
      throw error;
    }
  }
};