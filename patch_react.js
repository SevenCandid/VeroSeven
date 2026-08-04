const fs = require('fs');

// 1. Patch App.css to add .mobile-menu-btn
let appCss = fs.readFileSync('hq-dashboard/src/App.css', 'utf8');
appCss += `
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
}
`;
fs.writeFileSync('hq-dashboard/src/App.css', appCss);

// 2. Patch Topbar.jsx
let topbar = fs.readFileSync('hq-dashboard/src/components/Topbar.jsx', 'utf8');
topbar = topbar.replace(`import React from 'react';`, `import React from 'react';\nimport { Menu } from 'lucide-react';`);
topbar = topbar.replace(`const Topbar = () => {`, `const Topbar = ({ setIsMobileSidebarOpen }) => {`);
topbar = topbar.replace(`<div style={{ color: 'var(--text-secondary)' }}>
        VeroSeven Platform Admin
      </div>`, `<div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        VeroSeven Platform Admin
      </div>`);
fs.writeFileSync('hq-dashboard/src/components/Topbar.jsx', topbar);

// 3. Patch Sidebar.jsx
let sidebar = fs.readFileSync('hq-dashboard/src/components/Sidebar.jsx', 'utf8');
sidebar = sidebar.replace(`import { LogOut } from 'lucide-react';`, `import { LogOut, X } from 'lucide-react';`);
sidebar = sidebar.replace(`const Sidebar = ({ logoUrl, activeTab, setActiveTab, setIsAuth }) => {`, `const Sidebar = ({ logoUrl, activeTab, setActiveTab, setIsAuth, isMobileOpen, setIsMobileOpen }) => {\n  const handleTabClick = (tab) => {\n    setActiveTab(tab);\n    setIsMobileOpen(false);\n  };\n`);
sidebar = sidebar.replace(`    <aside className="sidebar">`, `    <aside className={\`sidebar \${isMobileOpen ? 'open' : ''}\`}>`);
sidebar = sidebar.replace(/onClick=\{\(\) => setActiveTab\('[^']+'\)\}/g, (match) => {
  const tab = match.match(/'([^']+)'/)[1];
  return `onClick={() => handleTabClick('${tab}')}`;
});
sidebar = sidebar.replace(`<div className="brand">`, `<div className="brand" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>\n        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>`);
sidebar = sidebar.replace(`<span>VeroSeven HQ</span>\n      </div>`, `<span>VeroSeven HQ</span>\n        </div>\n        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(false)}><X size={24} /></button>\n      </div>`);
fs.writeFileSync('hq-dashboard/src/components/Sidebar.jsx', sidebar);

// 4. Patch App.jsx
let appJsx = fs.readFileSync('hq-dashboard/src/App.jsx', 'utf8');
appJsx = appJsx.replace(`  const [activeTab, setActiveTab] = useState('overview');`, `  const [activeTab, setActiveTab] = useState('overview');\n  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);`);
appJsx = appJsx.replace(`<Sidebar logoUrl={logoUrl} activeTab={activeTab} setActiveTab={setActiveTab} setIsAuth={setIsAuth} />`, `<Sidebar logoUrl={logoUrl} activeTab={activeTab} setActiveTab={setActiveTab} setIsAuth={setIsAuth} isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />\n      <div className={\`sidebar-overlay \${isMobileSidebarOpen ? 'open' : ''}\`} onClick={() => setIsMobileSidebarOpen(false)}></div>`);
appJsx = appJsx.replace(`<Topbar />`, `<Topbar setIsMobileSidebarOpen={setIsMobileSidebarOpen} />`);
fs.writeFileSync('hq-dashboard/src/App.jsx', appJsx);

console.log('React components patched.');
