const fs = require('fs');

const content = fs.readFileSync('js/data/careersData.js', 'utf-8');

const lines = content.split('\n');
const outLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('future: ') && !line.trim().endsWith(',')) {
        line = line + ',';
    }
    outLines.push(line);
}

fs.writeFileSync('js/data/careersData.js', outLines.join('\n'), 'utf-8');
console.log('Fixed commas!');
