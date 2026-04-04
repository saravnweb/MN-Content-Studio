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

const files = walk('./app').concat(walk('./components'));
let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Need to revert text-gray-100 back to text-white if the className string ALSO contains bg-indigo, bg-red, bg-emerald, etc.
  // Actually, we can just find any className="..." blocks, and check inside them.
  content = content.replace(/className=(["`'])([^"']*)(["`'])/g, (match, prefix, classList, suffix) => {
    if (/(bg-indigo-|bg-blue-|bg-red-|bg-green-|bg-emerald-|bg-pink-|bg-purple-|bg-yellow-)/.test(classList)) {
      if (/\btext-gray-[123]00\b/.test(classList)) {
        return 'className=' + prefix + classList.replace(/\btext-gray-[123]00\b/g, 'text-white') + suffix;
      }
    }
    return match;
  });

  // What about `{ ... ? 'bg-indigo-600 text-gray-100' : '...'}` inside template literals?
  // Our regex above catches ` or ' inside className={...} if they are strings like `'bg-indigo-600 text-gray-100'`
  content = content.replace(/(['"`])([^'"`]*bg-(?:indigo|blue|red|green|emerald|pink|purple|yellow)-\d{2,3}[^'"`]*)(['"`])/g, (match, prefix, classList, suffix) => {
    if (/\btext-gray-[123]00\b/.test(classList)) {
        return prefix + classList.replace(/\btext-gray-[123]00\b/g, 'text-white') + suffix;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Fixed button text in: ' + file);
  }
});
console.log('Total files fixed: ' + changedFiles);
