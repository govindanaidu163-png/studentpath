import re
import json

with open('js/data/careersData.js', 'r', encoding='utf-8') as f:
    content = f.read()

def categorize(name, stream, ttype):
    name = name.lower()
    if 'engineer' in name or 'tech' in name or 'software' in name or 'data' in name or 'robotics' in name or stream == 'pcm':
        return 'Engineering'
    if 'doctor' in name or 'surgeon' in name or 'nurse' in name or 'medical' in name or stream == 'pcb':
        return 'Medical'
    if 'manager' in name or 'banker' in name or 'accountant' in name or 'finance' in name or stream == 'commerce' or 'business' in name:
        return 'Business'
    if 'sport' in name or 'athlete' in name or 'coach' in name:
        return 'Sports'
    if 'ias' in name or 'ips' in name or 'defence' in name or 'navy' in name or 'army' in name or 'government' in name or 'police' in name:
        return 'Government'
    return 'Creativity'

lines = content.split('\n')
out_lines = []
current_obj = {}

for line in lines:
    out_lines.append(line)
    if 'name: ' in line:
        current_obj['name'] = line.split('name:')[1].strip().strip(',').strip('\"')
    if 'stream: ' in line:
        current_obj['stream'] = line.split('stream:')[1].strip().strip(',').strip('\"')
    if 'type: ' in line:
        current_obj['type'] = line.split('type:')[1].strip().strip(',').strip('\"')
        
    if 'future: ' in line:
        cat = categorize(current_obj.get('name', ''), current_obj.get('stream', ''), current_obj.get('type', ''))
        out_lines.append(f'    category: \"{cat}\",')
        current_obj = {}

with open('js/data/careersData.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
print('Done!')
