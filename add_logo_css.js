const fs = require('fs');
const cssPath = 'c:/Users/DELL/VeroSeven/hq-dashboard/src/App.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Add .topbar-logo rules
const mobileLogoCss = `
.topbar-logo {
  display: none;
}
@media (max-width: 768px) {
  .topbar-logo {
    display: block;
  }
}
`;
fs.appendFileSync(cssPath, mobileLogoCss);
console.log('Added topbar logo CSS');
