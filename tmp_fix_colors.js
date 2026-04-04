const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app/(admin)');
let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/\btext-white\b/g, 'text-gray-100');
  content = content.replace(/\bbg-white\b/g, 'bg-gray-100');
  content = content.replace(/\bborder-white\b/g, 'border-gray-100');
  content = content.replace(/\btext-gray-950\b/g, 'text-gray-900');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated: ' + file);
  }
});
console.log('Total files updated: ' + changedFiles);
