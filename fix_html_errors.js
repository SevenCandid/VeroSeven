const fs = require('fs');
const path = require('path');

const marketingDir = 'c:/Users/DELL/VeroSeven/marketing-site';
const htmlFiles = fs.readdirSync(marketingDir).filter(f => f.endsWith('.html'));

let totalFixed = 0;

for (const file of htmlFiles) {
  const filePath = path.join(marketingDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix 1: Add 'noopener' to target="_blank" links missing it
  // Pattern: target="_blank" with rel that doesn't include noopener, or no rel at all
  const noopenerFixed = content.replace(
    /target="_blank"(?![^>]*rel=)([^>]*>)/g,
    (match, rest) => {
      changed = true;
      return `target="_blank" rel="noopener noreferrer"${rest}`;
    }
  );
  content = noopenerFixed;

  // Also fix existing rel attributes that have target="_blank" but rel doesn't include noopener
  content = content.replace(
    /target="_blank"([^>]*?)rel="([^"]*)"([^>]*>)/g,
    (match, before, relVal, after) => {
      if (!relVal.includes('noopener')) {
        changed = true;
        return `target="_blank"${before}rel="${relVal} noopener noreferrer"${after}`;
      }
      return match;
    }
  );

  // Fix 2: Add -webkit-backdrop-filter before backdrop-filter
  content = content.replace(
    /(?<!-webkit-)backdrop-filter:\s*([^;]+);/g,
    (match, value) => {
      if (content.includes(`-webkit-backdrop-filter: ${value.trim()}`)) return match;
      changed = true;
      return `-webkit-backdrop-filter: ${value.trim()};\n    backdrop-filter: ${value.trim()};`;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log(`Fixed: ${file}`);
  } else {
    console.log(`No changes needed: ${file}`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
