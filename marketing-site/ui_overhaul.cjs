const fs = require('fs');
const path = require('path');

const filesToUpdate = ['index.html', 'products.html', 'ecosystem.html', 'about.html', 'updates.html', 'contact.html'];

const emojiToLucide = {
  '🤖': 'bot',
  '🔗': 'link',
  '☁️': 'cloud',
  '🛡️': 'shield',
  '📊': 'bar-chart-2',
  '💻': 'monitor',
  '🧠': 'brain',
  '🔬': 'microscope',
  '💡': 'lightbulb',
  '🎯': 'target',
  '🚀': 'rocket',
  '⚡': 'zap',
  '🤝': 'users',
  '🌿': 'leaf'
};

const processHTML = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Add Lucide script
  if (!content.includes('lucide@latest')) {
    content = content.replace('</body>', '  <script src="https://unpkg.com/lucide@latest"></script>\n  <script>lucide.createIcons();</script>\n</body>');
  }

  // Convert old icon-title structure to card-header
  // Pattern: <div class="card-icon">emoji</div> \n <h3>title</h3>
  // We need to make this: <div class="card-header"><div class="card-icon"><i data-lucide="icon"></i></div><h3>title</h3></div>
  // Because it's hard to regex accurately over HTML lines, let's do a naive replace of the known emojis.
  
  for (const [emoji, lucideName] of Object.entries(emojiToLucide)) {
    // Replace standalone emojis in card-icons
    const regex1 = new RegExp(`<div class="card-icon">\\s*${emoji}\\s*</div>`, 'g');
    content = content.replace(regex1, `<div class="card-icon"><i data-lucide="${lucideName}"></i></div>`);
  }

  // Refactor Grid classes to allow 4-5 items per row instead of 3
  if (file === 'ecosystem.html' || file === 'about.html') {
    // Ecosystem visions and about visions have 5 cards. Let's change grid-3 to grid-5 for those sections.
    content = content.replace(/class="grid grid-3"/g, 'class="grid grid-4"'); 
    // We don't want grid-5 everywhere, grid-4 is safe for 4-5 items.
  }
  
  if (file === 'products.html') {
    // Products grid should be 4 per row
    content = content.replace(/class="grid grid-3"/g, 'class="grid grid-4"');
  }

  // Wrap icon + h3 in card-header using a regex
  // Find: <div class="card-icon">...</div> \s* <h3>...</h3>
  const wrapHeaderRegex = /(<div class="card-icon">[\s\S]*?<\/div>)\s*(<h3[\s\S]*?>[\s\S]*?<\/h3>)/g;
  content = content.replace(wrapHeaderRegex, '<div class="card-header">$1\n$2</div>');

  fs.writeFileSync(file, content);
  console.log(`Processed ${file}`);
};

filesToUpdate.forEach(processHTML);
console.log('UI Overhaul script completed.');
