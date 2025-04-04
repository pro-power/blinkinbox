// test-email-reception.js
const nodemailer = require('nodemailer');
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

// Function to create a test email in the database directly
async function createTestEmail(username) {
  try {
    const newEmail = new Email({
      username,
      sender: 'test@example.com',
      senderName: 'Test Sender',
      subject: 'Test Email Subject',
      text: "We have an amazing offer just for you. Something exciting, something exclusive! But you have to act fast before its gone.\n👉 [Insert vague but exciting deal\n👉 [Another enticing but unclear benefit\n👉 [One more reason they should care\nClick below to unlock your surprise!",
      html: '<p>This is a <strong>test email</strong> body HTML for testing purposes.</p>',
      receivedAt: new Date()
    });

    await newEmail.save();
    console.log(`Test email created for username: ${username}`);
    return newEmail;
  } catch (error) {
    console.error('Error creating test email:', error);
    throw error;
  }
}

// Function to send a test email via SMTP
async function sendTestEmail(toEmail) {
  // Create a test SMTP transporter (using Ethereal for testing)
  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Send a test email
  const info = await transporter.sendMail({
    from: '"Test Sender" <sephora@example.com>',
    to: toEmail,
    subject: "Test Email from BlinkInbox Tester",
    text: "We have an amazing offer just for you. Something exciting, something exclusive! But you have to act fast before its gone.\n👉 [Insert vague but exciting deal\n👉 [Another enticing but unclear benefit\n👉 [One more reason they should care\nClick below to unlock your surprise!",
    html: "<b>This is another test email</b> sent from the <i>BlinkInbox</i> testing script.",
  });

  console.log("Test email sent:");
  console.log("- Message ID:", info.messageId);
  console.log("- Preview URL:", nodemailer.getTestMessageUrl(info));
}

// Main test function
async function runTests() {
  try {
    // Test username
    const testUsername = `glorilla34161762`;
    const testEmail = `${testUsername}@blinkinbox.club`;
    
    // Method 1: Create test email directly in the database
    console.log("\n=== Testing Method 1: Direct DB insertion ===");
    const createdEmail = await createTestEmail(testUsername);
    console.log(`Test email created with ID: ${createdEmail._id}`);
    
    // Method 2: Send email via SMTP (if your SMTP handler is set up)
    console.log("\n=== Testing Method 2: SMTP sending ===");
    console.log(`Sending test email to: ${testEmail}`);
    try {
      await sendTestEmail(testEmail);
      console.log("Check your SMTP inbox/trap to see if the email was received");
    } catch (error) {
      console.log("SMTP test failed. This is expected if you don't have SMTP handling configured yet.");
      console.error(error.message);
    }

    // Close database connection
    await mongoose.connection.close();
    console.log("\nTests completed. Database connection closed.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the tests
runTests();