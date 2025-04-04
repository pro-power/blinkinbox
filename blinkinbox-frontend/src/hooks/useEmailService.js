import { useState, useEffect, useCallback } from 'react';
import { createEmail, getEmails } from '../services/api';
import { generateRandomEmail } from '../utils/helpers';

// Key for localStorage
const STORAGE_KEY = 'blinkinbox_email';
const EMAIL_EXPIRY_KEY = 'blinkinbox_email_expiry';
const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useEmailService = () => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    const expiryTime = localStorage.getItem(EMAIL_EXPIRY_KEY);
    
    if (storedEmail && expiryTime) {
      const now = Date.now();
      if (now < parseInt(expiryTime)) {
        setGeneratedEmail(storedEmail);
        // If there's a stored email, update the prefix for consistency
        const prefix = storedEmail.split('@')[0].replace(/\d+$/, ''); // Remove trailing numbers
        setEmailPrefix(prefix);
      } else {
        // Clear expired email
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EMAIL_EXPIRY_KEY);
      }
    }
  }, []);

  const generateEmail = useCallback(() => {
    let email;
    
    if (emailPrefix.trim()) {
      // If user provided a prefix, still add randomization
      const prefix = emailPrefix.trim();
      const timestamp = Date.now() % 10000; // Last 4 digits of current timestamp
      const randomNumber = Math.floor(Math.random() * 10000); // Random 4-digit number
      email = `${prefix}${timestamp}${randomNumber}@blinkinbox.club`;
    } else {
      // Otherwise use the fully random email
      email = generateRandomEmail();
    }
    
    setGeneratedEmail(email);
    
    // Store in localStorage with expiry time
    localStorage.setItem(STORAGE_KEY, email);
    localStorage.setItem(EMAIL_EXPIRY_KEY, String(Date.now() + EXPIRY_TIME));
    
    // Create the email on the server
    const username = email.split('@')[0];
    createEmail(username)
      .catch(error => {
        console.error('Error creating email:', error);
        setError('Failed to create email address. Please try again.');
      });
      
  }, [emailPrefix]);

  const copyEmail = useCallback(() => {
    if (!generatedEmail) return;
    
    navigator.clipboard.writeText(generatedEmail)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Could not copy text:', err));
  }, [generatedEmail]);

  const refreshInbox = useCallback(async () => {
    if (!generatedEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const username = generatedEmail.split('@')[0];
      const data = await getEmails(username);
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [generatedEmail]);

  // Auto-refresh inbox every 30 seconds if we have a generated email
  useEffect(() => {
    if (!generatedEmail) return;
    
    // Initial fetch
    refreshInbox();
    
    const interval = setInterval(refreshInbox, 30000);
    return () => clearInterval(interval);
  }, [generatedEmail, refreshInbox]);

  // Reset email when it expires
  useEffect(() => {
    const checkExpiry = () => {
      const expiryTime = localStorage.getItem(EMAIL_EXPIRY_KEY);
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        setGeneratedEmail('');
        setEmails([]);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EMAIL_EXPIRY_KEY);
      }
    };
    
    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return {
    emailPrefix,
    setEmailPrefix,
    generatedEmail,
    generateEmail,
    copyEmail,
    copied,
    emails,
    loading,
    refreshInbox,
    error
  };
};