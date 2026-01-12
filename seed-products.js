const db = require('better-sqlite3')('pos.db');

const categories = db.prepare('SELECT * FROM categories').all();
const catMap = {};
categories.forEach(c => catMap[c.name] = c.id);

const products = [
    // Seeds
    { name: 'Tomato Seeds (Hybrid)', category: 'Seeds', price: 450, stock: 100, description: 'High yield hybrid tomato seeds' },
    { name: 'Wheat Seeds (Lok-1)', category: 'Seeds', price: 40, stock: 500, description: 'Certified wheat seeds' },
    { name: 'Paddy Seeds (Basmati)', category: 'Seeds', price: 120, stock: 200, description: 'Premium Basmati rice seeds' },

    // Fertilizers
    { name: 'Urea (45kg)', category: 'Fertilizers', price: 266, stock: 50, description: 'Neem coated urea' },
    { name: 'DAP (50kg)', category: 'Fertilizers', price: 1350, stock: 40, description: 'Di-ammonium Phosphate' },
    { name: 'NPK 19-19-19', category: 'Fertilizers', price: 1200, stock: 30, description: 'Water soluble complex fertilizer' },

    // Tools
    { name: 'Hand Sickle', category: 'Tools', price: 150, stock: 25, description: 'Sharp steel sickle with wooden handle' },
    { name: 'Knapsack Sprayer', category: 'Tools', price: 2500, stock: 10, description: '16L Manual Sprayer' },

    // Crops (Produce)
    { name: 'Fresh Tomatoes', category: 'Crops', price: 40, stock: 100, description: 'Farm fresh tomatoes per kg' },
    { name: 'Potatoes', category: 'Crops', price: 25, stock: 200, description: 'Organic potatoes per kg' }
];

const insert = db.prepare('INSERT INTO products (name, category_id, price, stock_quantity, description) VALUES (@name, @category_id, @price, @stock, @description)');

db.transaction(() => {
    for (const p of products) {
        const catId = catMap[p.category];
        if (catId) {
            try {
                insert.run({
                    name: p.name,
                    category_id: catId,
                    price: p.price,
                    stock: p.stock,
                    description: p.description
                });
                console.log(`Added ${p.name}`);
            } catch (e) {
                console.log(`Skipped ${p.name} (maybe exists)`);
            }
        } else {
            console.log(`Category not found for ${p.name}`);
        }
    }
})();
console.log('Seeding complete.');
