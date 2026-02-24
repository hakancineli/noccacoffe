const fs = require('fs');
const file = './src/data/menuItems.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Rename 'Frappeler' to 'Soğuk İçecekler'
content = content.replace(/category: 'Frappeler'/g, "category: 'Soğuk İçecekler'");

// 2. Remove 'Frappeler' and 'Bubble Tea' from the exported `categories` array
content = content.replace(/,\s*'Frappeler'/g, "");
content = content.replace(/'Frappeler',\s*/g, "");
content = content.replace(/,\s*'Bubble Tea'/g, "");
content = content.replace(/'Bubble Tea',\s*/g, "");

// 3. To remove the objects for Bubble Tea, we can use a regex that matches the whole object block
// We know they look like: { id: XX, name: '...', category: 'Bubble Tea', ... },
content = content.replace(/\{\s*id:\s*\d+,\s*name:\s*[^,]+,\s*description:\s*[^,]+,\s*category:\s*'Bubble Tea'[\s\S]*?\},/g, "");

fs.writeFileSync(file, content);
