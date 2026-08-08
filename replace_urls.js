const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
        .replace(/assets\/vero_logo1\.png/g, 'assets/vero_logo.png')
        .replace(/assets\/vero_logo_favicon\.png/g, 'assets/favicon.png')
        .replace(/\/favicon\.ico/g, '/favicon.png');
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated', filePath);
    }
}

function traverseDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') traverseDir(fullPath);
        } else {
            replaceInFile(fullPath);
        }
    });
}

traverseDir(path.join(__dirname, 'marketing-site'));
traverseDir(path.join(__dirname, 'hq-dashboard'));
