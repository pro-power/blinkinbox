import React, { useState, useEffect } from 'react';
import { getEmailDetails } from '../services/api';

const EmailDetail = ({ username, emailId, onBack }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmailDetails = async () => {
      setLoading(true);
      try {
        const data = await getEmailDetails(username, emailId);
        setEmail(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching email details:', err);
        setError('Failed to load email details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (username && emailId) {
      fetchEmailDetails();
    }
  }, [username, emailId]);

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        boxShadow: 'var(--card-shadow)',
        border: 'var(--card-border)',
        textAlign: 'center'
      }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ animation: 'spin 2s linear infinite', color: 'var(--gray-500)' }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Loading email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        boxShadow: 'var(--card-shadow)',
        border: 'var(--card-border)',
        textAlign: 'center',
        color: 'var(--red-500)'
      }}>
        <p>{error}</p>
        <button 
          onClick={onBack}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--gray-100)',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  if (!email) return null;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 'var(--border-radius)',
      padding: '2rem',
      boxShadow: 'var(--card-shadow)',
      border: 'var(--card-border)'
    }}>
      {/* Email Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--gray-100)',
            border: '1px solid var(--gray-200)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Inbox
        </button>

        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700',
          marginBottom: '1rem',
          color: 'var(--gray-800)'
        }}>
          {email.subject}
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: 'var(--gray-50)',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: '600' }}>From: {email.sender}</div>
            <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              {new Date(email.receivedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--gray-50)',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
              Attachments ({email.attachments.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {email.attachments.map(attachment => (
                <div 
                  key={attachment.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <span>{attachment.filename}</span>
                  <span style={{ color: 'var(--gray-500)' }}>
                    ({formatFileSize(attachment.size)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Body */}
      <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
        {email.html ? (
          <div dangerouslySetInnerHTML={{ __html: email.html }} />
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>{email.text}</div>
        )}
      </div>
    </div>
  );
};

// Helper function to format file sizes
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default EmailDetail;