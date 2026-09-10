import React from 'react';
import { Menu, Settings, Mail } from 'lucide-react';

const Topbar = ({ setIsMobileSidebarOpen, logoUrl, emailProvider, setEmailProvider }) => {
  return (
    <header className="topbar">
      <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {logoUrl && <img src={logoUrl} alt="VeroSeven Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} className="topbar-logo" />}
          <span style={{ fontWeight: '500' }}>VeroSeven HQ</span>
        </div>
      </div>
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {emailProvider && setEmailProvider && (
          <div className="email-provider-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.2rem 0.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <Mail size={14} color="var(--text-secondary)" />
            <select 
              value={emailProvider} 
              onChange={(e) => setEmailProvider(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
              title="Select Email Dispatch Provider"
            >
              <option value="bird" style={{color: 'black'}}>Bird</option>
              <option value="sendgrid" style={{color: 'black'}}>SendGrid</option>
              <option value="resend" style={{color: 'black'}}>Resend</option>
              <option value="smtp" style={{color: 'black'}}>Google SMTP</option>
            </select>
          </div>
        )}
        <div className="user-profile">
          <div className="avatar">A</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
