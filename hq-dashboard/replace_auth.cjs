const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace all fetch() calls with apiFetch()
content = content.replace(/\bfetch\(/g, 'apiFetch(');

// Add apiFetch definition near the top, after the imports and isAuth state
// Let's find "const apiHost = window.location.hostname || 'localhost';" and insert apiFetch right after it
content = content.replace(
  "const apiHost = window.location.hostname || 'localhost';",
  `const apiHost = window.location.hostname || 'localhost';

  const apiFetch = async (url, options = {}) => {
    const headers = { ...options.headers, ...getAuthHeaders() };
    const response = await fetch(url, { ...options, headers });
    
    // Auto logout on 401/403 for admin routes
    if ((response.status === 401 || response.status === 403) && url.includes('/api/admin')) {
      removeToken();
      setIsAuth(false);
    }
    
    return response;
  };`
);

// We also need to add the logout button to the sidebar.
// Find: <ul className="sidebar-nav">
content = content.replace(
  /<ul className="sidebar-nav">/,
  `<ul className="sidebar-nav">
          <li style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => { removeToken(); setIsAuth(false); }} 
              style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: '#ff4b4b', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              🚪 Logout
            </button>
          </li>`
);

// Finally, wrap the return block with the auth check
// We will replace the main return with a conditional return
content = content.replace(
  `return (\n    <div className="app-container">`,
  `if (!isAuth) {
    return <Login onLoginSuccess={() => setIsAuth(true)} apiHost={apiHost} />;
  }

  return (
    <div className="app-container">`
);

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx updated with auth logic.');
