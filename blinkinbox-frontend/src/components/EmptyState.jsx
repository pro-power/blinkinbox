import React from 'react';

const EmptyState = () => {
  return (
    <div 
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
        width="64" 
        height="64" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ color: 'var(--gray-300)' }}
      >
        <path d="M22 10V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12c0 1.1.9 2 2 2h16a2 2 0 002-2v-4"></path>
        <path d="M22 10L12 16l-10-6"></path>
        <path d="M12 16v6"></path>
        <path d="M12 10v3"></path>
        <path d="M2 10l10 6 10-6"></path>
      </svg>
      <p>Your inbox is empty. New emails will appear here.</p>
    </div>
  );
};

export default EmptyState;