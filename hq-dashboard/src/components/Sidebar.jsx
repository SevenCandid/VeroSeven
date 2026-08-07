import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  ShieldCheck,
  Bell,
  Sparkles,
  Layers,
  Crown,
  Activity,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { removeToken } from '../auth';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'admin-hub', label: 'Admin Hub', icon: ShieldCheck },
  { id: 'updates', label: 'Updates', icon: Bell },
  { id: 'opportunities', label: 'Opportunities', icon: Sparkles },
  { id: 'cms', label: 'CMS Content', icon: Layers },
  { id: 'cms-flagship', label: 'Flagship Product', icon: Crown },
  { id: 'activity', label: 'Activity Logs', icon: Activity },
];

const Sidebar = ({
  logoUrl,
  activeTab,
  setActiveTab,
  setIsAuth,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  toggleCollapse
}) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-left" onClick={() => handleTabClick('overview')} title="VeroSeven HQ Overview">
          <img src={logoUrl} alt="VeroSeven Logo" className="brand-logo" />
          {!isCollapsed && <span className="brand-text">VeroSeven HQ</span>}
        </div>
        
        {/* Mobile Close Button */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsMobileOpen(false)}
          title="Close Menu"
          aria-label="Close Menu"
        >
          <X size={20} />
        </button>

        {/* Desktop Collapse Toggle Icon next to VeroSeven HQ */}
        <button
          type="button"
          className="sidebar-collapse-btn header-toggle"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Navigation List */}
      <ul className="nav-menu">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <li
            key={id}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => handleTabClick(id)}
            title={isCollapsed ? label : undefined}
          >
            <Icon size={18} className="nav-icon" />
            {!isCollapsed && <span className="nav-label">{label}</span>}
          </li>
        ))}
      </ul>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        {/* Toggle button right above logout button */}
        <button
          type="button"
          className="sidebar-toggle-row"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>

        {/* Logout Button */}
        <button 
          type="button"
          className="logout-btn"
          onClick={() => { removeToken(); setIsAuth(false); }} 
          title={isCollapsed ? "Logout" : undefined}
          aria-label="Logout"
        >
          <LogOut size={16} className="logout-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
