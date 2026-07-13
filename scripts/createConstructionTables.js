const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(
    './database/construction.db'
);

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            name TEXT,
            budget REAL,
            status TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS purchase_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            project_id INTEGER,
            material TEXT,
            amount REAL,
            status TEXT
        )
    `);
     
    db.run(`
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            pr_id INTEGER,
            vendor_id INTEGER,
            po_number TEXT,
            amount REAL,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
   db.run(`
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            gst TEXT,
            address TEXT,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS goods_receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            po_id INTEGER,
            quantity_received REAL,
            remarks TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
   
    db.run(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            po_id INTEGER,
            invoice_number TEXT,
            amount REAL,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            invoice_id INTEGER,
            payment_reference TEXT,
            amount REAL,
            payment_date TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
   
    db.run(`
        CREATE TABLE IF NOT EXISTS vendor_invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            builder TEXT,
            po_id INTEGER,
            invoice_number TEXT,
            amount REAL,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);


});

console.log('Construction tables created');

db.close();