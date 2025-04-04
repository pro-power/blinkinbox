import React, { useState, useEffect } from 'react';

const EmailGenerator = ({ 
  emailPrefix, 
  setEmailPrefix, 
  generatedEmail, 
  generateEmail,
  copyEmail,
  copied,
  error
}) => {
  const [animate, setAnimate] = useState(false);
  const [localError, setLocalError] = useState('');

  // Validate email prefix
  const validateAndGenerateEmail = () => {
    // Reset previous error
    setLocalError('');
    
    // Check if prefix is empty - this is fine, we'll generate a random one
    if (!emailPrefix.trim()) {
      generateEmail();
      return;
    }
    
    // Check for invalid characters
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(emailPrefix)) {
      setLocalError('Only letters, numbers, dots, underscores, and hyphens are allowed');
      return;
    }
    
    // Check if prefix already contains @blinkinbox.club
    if (emailPrefix.includes('@')) {
      setLocalError('Please enter only the prefix (without @blinkinbox.club)');
      return;
    }
    
    // If all validation passes, generate the email
    generateEmail();
  };

  useEffect(() => {
    if (generatedEmail) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [generatedEmail]);

  return (
    <div className="card" style={{
      backgroundColor: 'white',
      borderRadius: 'var(--border-radius)',
      padding: '2rem',
      boxShadow: 'var(--card-shadow)',
      border: 'var(--card-border)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      transform: 'translateY(0)'
    }}>
      <h2>Generate Your Temporary Email</h2>
      
      {/* Input form */}
      <div className="form-row" style={{
        display: 'flex',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: `1px solid ${localError ? 'var(--red-500, #ef4444)' : 'var(--gray-200)'}`,
        transition: 'all 0.2s ease',
      }}>
        <input 
          type="text" 
          value={emailPrefix}
          onChange={(e) => {
            setEmailPrefix(e.target.value);
            // Clear error when user types
            if (localError) setLocalError('');
          }}
          placeholder="Enter your preferred email prefix" 
          className="form-input"
          style={{
            flex: 1,
            padding: '1rem 1.25rem',
            border: 'none',
            fontSize: '1rem',
            outline: 'none',
            color: 'var(--gray-700)'
          }}
        />
        <span 
          style={{
            backgroundColor: 'var(--gray-50)',
            padding: '1rem 1.25rem',
            fontWeight: 500,
            color: 'var(--gray-500)',
            borderLeft: '1px solid var(--gray-200)'
          }}
        >
          @blinkinbox.club
        </span>
      </div>
      
      {/* Error message */}
      {(localError || error) && (
        <div style={{
          color: 'var(--red-500, #ef4444)',
          fontSize: '0.875rem',
          marginTop: '-0.75rem',
          marginBottom: '1rem'
        }}>
          {localError || error}
        </div>
      )}
      
      <button 
        onClick={validateAndGenerateEmail}
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4"></path>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        Generate Email
      </button>
      
      {generatedEmail && (
        <div 
          className={`fade-in ${animate ? 'active' : ''}`}
          style={{
            backgroundColor: 'var(--primary-light)',
            borderRadius: 'var(--border-radius)',
            padding: '1.75rem',
            marginTop: '2rem',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          <h2>Your Temporary Email</h2>
          <div className="email-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span className="email-preview" style={{
              fontWeight: 600,
              fontSize: '1.125rem',
              color: 'var(--primary)',
              wordBreak: 'break-all',
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              {generatedEmail}
            </span>
            <button 
              onClick={copyEmail}
              style={{
                backgroundColor: 'white',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                padding: '0.625rem 1.25rem',
                whiteSpace: 'nowrap',
                borderRadius: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailGenerator;