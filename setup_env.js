const fs = require('fs');
const content = `DATABASE_URL="postgresql://motract_user:MF7xZZCgPlZr9UGFF4A7doH60VSCIb6d@dpg-d5ba9qfgi27c738ok7v0-a.oregon-postgres.render.com/motract_avqm?sslmode=require"
PORT=3000`;
fs.writeFileSync('backend/.env', content, { encoding: 'utf8' });
console.log('.env file written successfully');
