import React from 'react';
import { Menu } from 'lucide-react';

const Topbar = ({ setIsMobileSidebarOpen, logoUrl }) => {
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
      <div className="user-profile">
        <div className="avatar">A</div>
      </div>
    </header>
  );
};

export default Topbar;
