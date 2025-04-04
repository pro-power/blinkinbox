// dev-mail-server.js - A simple SMTP server for development testing
const SMTPServer = require('smtp-server').SMTPServer;
const simpleParser = require('mailparser').simpleParser;
const mongoose = require('mongoose');
const Email = require('./models/email'); // Adjust path as needed
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create the SMTP server
const server = new SMTPServer({
  // Disable authentication for development
  disabledCommands: ['AUTH'],
  
  // Do not validate email addresses
  disableReverseLookup: true,
  
  // Maximum allowed message size in bytes
  size: 25 * 1024 * 1024, // 25 MB
  
  // Process incoming emails
  onData(stream, session, callback) {
    let mailData = '';
    
    stream.on('data', (chunk) => {
      mailData += chunk;
    });
    
    stream.on('end', async () => {
      try {
        // Parse the email
        const parsed = await simpleParser(mailData);
        
        // Extract username from recipient
        const to = parsed.to.text;
        const username = to.split('@')[0];
        
        console.log(`Received email for: ${to}`);
        console.log(`Subject: ${parsed.subject}`);
        
        // Create an Email document in MongoDB
        const newEmail = new Email({
          username: username,
          sender: parsed.from.text,
          senderName: parsed.from.value[0].name || '',
          subject: parsed.subject || '(No Subject)',
          text: parsed.text || '',
          html: parsed.html || '',
          receivedAt: new Date(),
          read: false,
          starred: false
        });
        
        // Save attachments if any
        if (parsed.attachments && parsed.attachments.length > 0) {
          newEmail.attachments = parsed.attachments.map(att => ({
            filename: att.filename,
            contentType: att.contentType,
            contentDisposition: att.contentDisposition,
            content: att.content
          }));
        }
        
        // Save to database
        await newEmail.save();
        console.log(`Email saved to database with ID: ${newEmail._id}`);
        
        callback();
      } catch (error) {
        console.error('Error processing email:', error);
        callback(new Error('Error processing email'));
      }
    });
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      callback(new Error('Error processing email'));
    });
  }
});

// Start the server
const PORT = process.env.SMTP_PORT || 2525;
server.listen(PORT, () => {
  console.log(`Development SMTP server running on port ${PORT}`);
  console.log(`Ready to receive emails for any address @${process.env.DOMAIN || 'blinkinbox.club'}`);
  console.log(`To test, send an email to username@localhost:${PORT}`);
});

// Handle errors
server.on('error', (error) => {
  console.error('SMTP Server error:', error);
});
