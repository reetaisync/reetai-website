const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve('./database/construction.db');

console.log('USING DB:', dbPath);

const db = new sqlite3.Database(dbPath);

module.exports = db;