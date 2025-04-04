import React from 'react';
import EmailItem from './EmailItem';
import EmptyState from './EmptyState';

const Inbox = ({ emails, loading, refreshInbox, onEmailSelect }) => {
  return (
    <div className="card inbox-container"
      style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        boxShadow: 'var(--card-shadow)',
        border: 'var(--card-border)'
      }}
    >
      <div className="inbox-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--gray-200)',
          marginBottom: '1.25rem'
        }}
      >
        <h2 style={{ margin: 0 }}>Your Inbox</h2>
        <div>
          <button 
            onClick={refreshInbox}
            className="refresh-button"
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--gray-50)',
              color: 'var(--gray-600)',
              border: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gray-100)';
              e.currentTarget.style.color = 'var(--gray-800)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--gray-50)';
              e.currentTarget.style.color = 'var(--gray-600)';
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
              className={loading ? 'spin' : ''}
            >
              <path d="M1 4v6h6"></path>
              <path d="M23 20v-6h-6"></path>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="inbox-content">
        {loading ? (
          <div className="loading-state"
            style={{
              textAlign: 'center',
              padding: '4rem 0',
              color: 'var(--gray-500)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
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
              className="spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <p>Checking for new emails...</p>
          </div>
        ) : emails.length > 0 ? (
          <div className="email-list" 
            style={{ 
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid var(--gray-200)'
            }}
          >
            {emails.map((email, index) => (
              <EmailItem 
                key={email.id}
                email={email}
                delay={index * 0.1}
                onSelect={() => onEmailSelect(email.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Inbox;