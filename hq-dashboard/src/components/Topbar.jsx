import React from 'react';
import { Menu } from 'lucide-react';

const Topbar = ({ setIsMobileSidebarOpen }) => {
  return (
    <header className="topbar">
      <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        VeroSeven Platform Admin
      </div>
      <div className="user-profile">
        <div className="avatar">A</div>
      </div>
    </header>
  );
};

export default Topbar;
