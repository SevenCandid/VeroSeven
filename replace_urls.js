const fs = require('fs');
const path = require('path');

const targetDirs = ['./marketing-site', './hq-dashboard/src'];

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const regexes = [
  { pattern: /`http:\/\/\$\{apiHost\}:3001/g, replacement: '`https://veroseven-api.onrender.com' },
  { pattern: /'http:\/\/localhost:3001/g, replacement: "'https://veroseven-api.onrender.com" },
  { pattern: /`http:\/\/localhost:3001/g, replacement: "`https://veroseven-api.onrender.com" }
];

let changedFiles = 0;

targetDirs.forEach(dir => {
  const files = walkSync(dir);
  files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.html') || file.endsWith('.cjs')) {
      let content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      
      regexes.forEach(regex => {
        newContent = newContent.replace(regex.pattern, regex.replacement);
      });

      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated:', file);
        changedFiles++;
      }
    }
  });
});

console.log(`Updated ${changedFiles} files.`);
