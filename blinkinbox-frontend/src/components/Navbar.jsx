import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile viewport and handle resize events
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Close mobile menu when switching to desktop
      if (!mobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    // Initial check
    checkIsMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [isMenuOpen]); // Add isMenuOpen as a dependency

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      padding: '1.2rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: 'var(--card-border)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--primary)',
          letterSpacing: '-0.025em'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '32px', height: '32px' }}>
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
          <span>BlinkInbox</span>
        </div>

        {/* Hamburger menu button - only show on mobile */}
        {isMobile && (
          <button 
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            {isMenuOpen ? (
              // X icon when menu is open
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              // Hamburger icon when menu is closed
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        )}

        {/* Desktop navigation - only show on desktop */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2rem' }}>
            <NavLink href="#">Home</NavLink>
            <NavLink href="#">Features</NavLink>
            <NavLink href="#">FAQ</NavLink>
            <NavLink href="#">Contact</NavLink>
          </div>
        )}
      </div>

      {/* Mobile menu - only show when menu is open and on mobile */}
      {isMobile && isMenuOpen && (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            background: 'white',
            borderTop: '1px solid var(--gray-200)'
          }}
        >
          <NavLink href="#" isMobile>Home</NavLink>
          <NavLink href="#" isMobile>Features</NavLink>
          <NavLink href="#" isMobile>FAQ</NavLink>
          <NavLink href="#" isMobile>Contact</NavLink>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, isMobile = false }) => {
  return (
    <a 
      href={href} 
      style={{
        color: 'var(--gray-600)',
        textDecoration: 'none',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        position: 'relative',
        padding: isMobile ? '0.75rem 0' : '0.25rem 0',
        borderBottom: isMobile ? '1px solid var(--gray-100)' : 'none',
        width: isMobile ? '100%' : 'auto',
        display: 'block'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = 'var(--primary)';
        if (!isMobile) {
          const after = document.createElement('style');
          after.innerHTML = `
            ${e.target.tagName.toLowerCase()}[href="${href}"]::after {
              content: '';
              position: absolute;
              width: 100%;
              height: 2px;
              bottom: 0;
              left: 0;
              background-color: var(--primary);
              transition: width 0.2s ease;
            }
          `;
          document.head.appendChild(after);
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.color = 'var(--gray-600)';
        if (!isMobile) {
          const styles = document.querySelectorAll('style');
          styles.forEach(style => {
            if (style.innerHTML.includes(`[href="${href}"]::after`)) {
              document.head.removeChild(style);
            }
          });
        }
      }}
    >
      {children}
    </a>
  );
};

export default Navbar;