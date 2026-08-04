import React from 'react';

const Topbar = () => {
  return (
    <header className="topbar">
      <div style={{ color: 'var(--text-secondary)' }}>
        VeroSeven Platform Admin
      </div>
      <div className="user-profile">
        <div className="avatar">A</div>
      </div>
    </header>
  );
};

export default Topbar;
