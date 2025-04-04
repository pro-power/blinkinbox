import React from 'react';

const EmailItem = ({ email, delay = 0, onSelect }) => {
  const { id, sender, subject, preview, time, read } = email;
  const initial = sender.charAt(0).toUpperCase();

  const handleClick = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1.25rem',
        borderBottom: '1px solid var(--gray-200)',
        cursor: 'pointer',
        gap: '1rem',
        animation: `fadeIn 0.3s ease forwards ${delay}s`,
        transition: 'background-color 0.15s ease',
        backgroundColor: read ? 'white' : 'var(--primary-light)',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--gray-50)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = read ? 'white' : 'var(--primary-light)';
      }}
    >
      <div 
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          flexShrink: 0
        }}
      >
        {initial}
      </div>
      <div 
        style={{
          flex: 1,
          minWidth: 0
        }}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.25rem'
          }}
        >
          <div style={{ fontWeight: !read ? 700 : 500, color: 'var(--gray-800)' }}>
            {!read && (
              <span 
                style={{
                  display: 'inline-block',
                  width: '0.5rem',
                  height: '0.5rem',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '50%',
                  marginRight: '0.5rem'
                }}
              />
            )}
            {sender}
          </div>
          <span 
            style={{
              color: 'var(--gray-500)',
              fontSize: '0.875rem',
              fontWeight: 400
            }}
          >
            {time}
          </span>
        </div>
        <div 
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--gray-600)',
            fontWeight: !read ? 600 : 400
          }}
        >
          {subject}
        </div>
        <div 
          style={{
            fontSize: '0.875rem',
            color: 'var(--gray-500)',
            marginTop: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {preview}
        </div>
      </div>
    </div>
  );
};

export default EmailItem;