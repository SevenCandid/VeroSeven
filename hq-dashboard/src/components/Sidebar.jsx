import React from 'react';
import { LogOut, X } from 'lucide-react';
import { removeToken } from '../auth';

const Sidebar = ({ logoUrl, activeTab, setActiveTab, setIsAuth, isMobileOpen, setIsMobileOpen }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      <div className="brand" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src={logoUrl} alt="VeroSeven Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
        <span>VeroSeven HQ</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(false)}><X size={24} /></button>
      </div>
      
      <ul className="nav-menu">
        <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabClick('overview')}>Overview</li>
        <li className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => handleTabClick('projects')}>Projects</li>
        <li className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => handleTabClick('applications')}>Applications</li>
        <li className={`nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => handleTabClick('team')}>Team</li>
        <li className={`nav-item ${activeTab === 'admin-hub' ? 'active' : ''}`} onClick={() => handleTabClick('admin-hub')}>Admin Hub</li>
        <li className={`nav-item ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => handleTabClick('updates')}>Updates</li>
        <li className={`nav-item ${activeTab === 'opportunities' ? 'active' : ''}`} onClick={() => handleTabClick('opportunities')}>Opportunities</li>
        <li className={`nav-item ${activeTab === 'cms' ? 'active' : ''}`} onClick={() => handleTabClick('cms')}>CMS Content</li>
        <li className={`nav-item ${activeTab === 'cms-flagship' ? 'active' : ''}`} onClick={() => handleTabClick('cms-flagship')}>Flagship Product</li>
        <li className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => handleTabClick('activity')}>Activity Logs</li>
      </ul>
      <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => { removeToken(); setIsAuth(false); }} 
          style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: '#ff4b4b', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500' }}
        >
          <><LogOut size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Logout</>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
