import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EmailGenerator from './components/EmailGenerator';
import Inbox from './components/Inbox';
import EmailDetail from './components/EmailDetail';
import { useEmailService } from './hooks/useEmailService';
import './styles/responsive.css'; // Import the responsive CSS

function App() {
  const { 
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
  } = useEmailService();

  const [selectedEmailId, setSelectedEmailId] = useState(null);

  // Extract username from generated email
  const username = generatedEmail ? generatedEmail.split('@')[0] : '';

  // Handle email selection
  const handleEmailSelect = (emailId) => {
    setSelectedEmailId(emailId);
  };

  // Handle back to inbox
  const handleBackToInbox = () => {
    setSelectedEmailId(null);
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="container">
        <section className="section">
          <EmailGenerator 
            emailPrefix={emailPrefix}
            setEmailPrefix={setEmailPrefix}
            generatedEmail={generatedEmail}
            generateEmail={generateEmail}
            copyEmail={copyEmail}
            copied={copied}
            error={error}
          />
        </section>
        
        {generatedEmail && (
          <section className="section">
            {selectedEmailId ? (
              <EmailDetail 
                username={username}
                emailId={selectedEmailId}
                onBack={handleBackToInbox}
              />
            ) : (
              <Inbox 
                emails={emails}
                loading={loading}
                refreshInbox={refreshInbox}
                onEmailSelect={handleEmailSelect}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;