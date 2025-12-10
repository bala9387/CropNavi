import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'pos.db');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

// Export the database instance
export default db;

// Generic query function
export function query(sql: string, params: any[] = []) {
  return db.prepare(sql).all(...params);
}

// Generic run function for inserts/updates/deletes
export function run(sql: string, params: any[] = []) {
  return db.prepare(sql).run(...params);
}

// Generic get function for single row
export function get(sql: string, params: any[] = []) {
  return db.prepare(sql).get(...params);
}

// Function to initialize the database with schema
export function initDatabase() {
  // Users table
  run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      price REAL NOT NULL,
      cost_price REAL,
      sku TEXT UNIQUE,
      barcode TEXT,
      stock_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    )
  `);

  // Customers table
  run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Suppliers table
  run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sales table
  run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      total_amount REAL NOT NULL,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'completed',
      notes TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL
    )
  `);

  // Sale Items table
  run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
    )
  `);

  // Inventory table (for tracking stock movements)
  run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment'
      quantity INTEGER NOT NULL,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      reference_id INTEGER, -- sale_id or purchase_id
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )
  `);

  // Payments table
  run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'cash', 'card', 'bank_transfer'
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'paid',
      FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
    )
  `);

  // Settings table
  run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT
    )
  `);

  // Insert default admin user (password: admin123 hashed simply for demo; use bcrypt in production)
  const adminUser = get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminUser) {
    run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
  }

  // Insert default categories (tailored for farmers/crops)
  const categories = [
    { name: 'Crops', description: 'Major crop products' },
    { name: 'Seeds', description: 'Seed varieties' },
    { name: 'Fertilizers', description: 'Fertilizer products' },
    { name: 'Tools', description: 'Farming tools and equipment' }
  ];

  categories.forEach(cat => {
    const existing = get('SELECT id FROM categories WHERE name = ?', [cat.name]);
    if (!existing) {
      run('INSERT INTO categories (name, description) VALUES (?, ?)', [cat.name, cat.description]);
    }
  });

  console.log('Database initialized successfully.');
}

// Call init on import for setup
initDatabase();
