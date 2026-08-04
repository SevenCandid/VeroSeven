import React from 'react';
import { LogOut } from 'lucide-react';
import { removeToken } from '../auth';

const Sidebar = ({ logoUrl, activeTab, setActiveTab, setIsAuth }) => {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logoUrl} alt="VeroSeven Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
        <span>VeroSeven HQ</span>
      </div>
      
      <ul className="nav-menu">
        <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</li>
        <li className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</li>
        <li className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>Applications</li>
        <li className={`nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>Team</li>
        <li className={`nav-item ${activeTab === 'admin-hub' ? 'active' : ''}`} onClick={() => setActiveTab('admin-hub')}>Admin Hub</li>
        <li className={`nav-item ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')}>Updates</li>
        <li className={`nav-item ${activeTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveTab('opportunities')}>Opportunities</li>
        <li className={`nav-item ${activeTab === 'cms' ? 'active' : ''}`} onClick={() => setActiveTab('cms')}>CMS Content</li>
        <li className={`nav-item ${activeTab === 'cms-flagship' ? 'active' : ''}`} onClick={() => setActiveTab('cms-flagship')}>Flagship Product</li>
        <li className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity Logs</li>
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
