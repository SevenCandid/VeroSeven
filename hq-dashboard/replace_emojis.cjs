const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Add imports at the top
if (!content.includes('lucide-react')) {
  content = content.replace(
    "import { isAuthenticated, removeToken, getAuthHeaders } from './auth'",
    "import { isAuthenticated, removeToken, getAuthHeaders } from './auth'\nimport { Globe, Settings, BookOpen, Pencil, Trash2, LogOut, Plus, Search, ExternalLink } from 'lucide-react';"
  );
}

// Replace exact strings
const replacements = [
  { from: '🌐 View Site', to: '<><Globe size={14} style={{marginRight: "4px", verticalAlign: "middle"}} /> View Site</>' },
  { from: '⚙️ Dashboard', to: '<><Settings size={14} style={{marginRight: "4px", verticalAlign: "middle"}} /> Dashboard</>' },
  { from: '📚 Docs', to: '<><BookOpen size={14} style={{marginRight: "4px", verticalAlign: "middle"}} /> Docs</>' },
  { from: '✏️', to: '<Pencil size={16} />' },
  { from: '🗑️', to: '<Trash2 size={16} />' },
  { from: '🚪 Logout', to: '<><LogOut size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Logout</>' },
  { from: '+ Add Project / Product', to: '<><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Project / Product</>' },
  { from: '+ Add Application', to: '<><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Application</>' },
  { from: '+ Add Team Member', to: '<><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Team Member</>' },
  { from: '+ Add Update', to: '<><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Update</>' },
  { from: '+ Add Opportunity', to: '<><Plus size={16} style={{marginRight: "4px", verticalAlign: "middle"}} /> Add Opportunity</>' }
];

for (let r of replacements) {
  content = content.split(r.from).join(r.to);
}

fs.writeFileSync('src/App.jsx', content);
console.log('Emojis replaced with Lucide icons.');
