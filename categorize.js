const fs = require('fs');

const content = fs.readFileSync('js/data/careersData.js', 'utf-8');

function categorize(name, stream, ttype) {
    name = (name || '').toLowerCase();
    stream = (stream || '').toLowerCase();
    if (name.includes('engineer') || name.includes('tech') || name.includes('software') || name.includes('data') || name.includes('robotics') || stream === 'pcm') {
        return 'Engineering';
    }
    if (name.includes('doctor') || name.includes('surgeon') || name.includes('nurse') || name.includes('medical') || stream === 'pcb') {
        return 'Medical';
    }
    if (name.includes('manager') || name.includes('banker') || name.includes('accountant') || name.includes('finance') || stream === 'commerce' || name.includes('business')) {
        return 'Business';
    }
    if (name.includes('sport') || name.includes('athlete') || name.includes('coach')) {
        return 'Sports';
    }
    if (name.includes('ias') || name.includes('ips') || name.includes('defence') || name.includes('navy') || name.includes('army') || name.includes('government') || name.includes('police')) {
        return 'Government';
    }
    return 'Creativity';
}

const lines = content.split('\n');
const outLines = [];
let currentObj = {};

for (const line of lines) {
    outLines.push(line);
    if (line.includes('name: ')) {
        currentObj.name = line.split('name:')[1].trim().replace(/,$/, '').replace(/^"|"$/g, '');
    }
    if (line.includes('stream: ')) {
        currentObj.stream = line.split('stream:')[1].trim().replace(/,$/, '').replace(/^"|"$/g, '');
    }
    if (line.includes('type: ')) {
        currentObj.type = line.split('type:')[1].trim().replace(/,$/, '').replace(/^"|"$/g, '');
    }
    
    if (line.includes('future: ')) {
        const cat = categorize(currentObj.name, currentObj.stream, currentObj.type);
        outLines.push(`    category: "${cat}",`);
        currentObj = {};
    }
}

fs.writeFileSync('js/data/careersData.js', outLines.join('\n'), 'utf-8');
console.log('Done!');
