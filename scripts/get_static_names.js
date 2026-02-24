const { allMenuItems } = require('./src/data/menuItems');
const names = allMenuItems.map(item => item.name);
console.log(JSON.stringify(names));
