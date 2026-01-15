
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'pos.db');
const db = new Database(dbPath);

const email = 'k.v.balachandhar9387@gmail.com';
const user = db.prepare('SELECT * FROM users WHERE username = ?').get(email);

if (user) {
    console.log('User FOUND:', user);
} else {
    console.log('User NOT FOUND');
    // List all users to be sure
    const allUsers = db.prepare('SELECT * FROM users').all();
    console.log('All Users:', allUsers);
}
