const fs = require('fs');
const cssPath = 'c:/Users/DELL/VeroSeven/hq-dashboard/src/App.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Replace the offending styles in the first media query
content = content.replace(/\.nav-menu\s*\{\s*flex-direction:\s*row;\s*overflow-x:\s*auto;\s*padding-bottom:\s*0\.5rem;\s*\}/g, '');
content = content.replace(/\.sidebar\s*\{\s*width:\s*100%;\s*height:\s*auto;\s*border-right:\s*none;\s*border-bottom:\s*1px\s*solid\s*var\(--border-color\);\s*padding:\s*1rem;\s*\}/g, '');
content = content.replace(/\.nav-item\s*\{\s*white-space:\s*nowrap;\s*\}/g, '');

fs.writeFileSync(cssPath, content);
console.log('Fixed App.css');
