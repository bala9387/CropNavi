import db, { run, get, query } from './db';

export function seedSalesData() {
    console.log('🌱 Seeding sales data...');

    // First, ensure we have some products
    const existingProducts: any[] = query('SELECT * FROM products LIMIT 5');

    if (existingProducts.length === 0) {
        console.log('📦 Adding sample products first...');

        // Get category IDs
        const cropsCategory: any = get('SELECT id FROM categories WHERE name = ?', ['Crops']);
        const seedsCategory: any = get('SELECT id FROM categories WHERE name = ?', ['Seeds']);
        const fertilizersCategory: any = get('SELECT id FROM categories WHERE name = ?', ['Fertilizers']);

        const sampleProducts = [
            { name: 'Paddy Rice - IR64', category_id: cropsCategory?.id || 1, price: 2500, cost_price: 2000, sku: 'RICE-IR64', stock_quantity: 500 },
            { name: 'Wheat - HI-8759', category_id: cropsCategory?.id || 1, price: 2200, cost_price: 1800, sku: 'WHT-8759', stock_quantity: 350 },
            { name: 'Tomato Seeds - Hybrid', category_id: seedsCategory?.id || 2, price: 450, cost_price: 300, sku: 'TOM-HYB', stock_quantity: 200 },
            { name: 'NPK Fertilizer 10:26:26', category_id: fertilizersCategory?.id || 3, price: 1200, cost_price: 950, sku: 'NPK-1026', stock_quantity: 150 },
            { name: 'Urea Fertilizer', category_id: fertilizersCategory?.id || 3, price: 850, cost_price: 700, sku: 'UREA-50KG', stock_quantity: 300 },
            { name: 'Cotton Seeds - BT', category_id: seedsCategory?.id || 2, price: 680, cost_price: 500, sku: 'COT-BT', stock_quantity: 180 },
            { name: 'Maize Seeds', category_id: seedsCategory?.id || 2, price: 320, cost_price: 250, sku: 'MAZ-900', stock_quantity: 400 },
            { name: 'Pesticide - Organic', category_id: fertilizersCategory?.id || 3, price: 550, cost_price: 400, sku: 'PEST-ORG', stock_quantity: 100 },
        ];

        sampleProducts.forEach(product => {
            run(
                'INSERT INTO products (name, category_id, price, cost_price, sku, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
                [product.name, product.category_id, product.price, product.cost_price, product.sku, product.stock_quantity]
            );
        });

        console.log('✅ Sample products added');
    }

    // Get all products for creating sales
    const products: any[] = query('SELECT * FROM products');

    if (products.length === 0) {
        console.log('❌ No products available to create sales');
        return;
    }

    // Check if sales already exist
    const existingSales: any[] = query('SELECT * FROM sales LIMIT 1');

    if (existingSales.length > 0) {
        console.log('ℹ️  Sales data already exists');
        return;
    }

    // Add some customers first
    const customers = [
        { name: 'Rajesh Kumar', phone: '9876543210', address: 'Village Manapakkam, Tamil Nadu' },
        { name: 'Priya Sharma', phone: '8765432109', address: 'Coimbatore District' },
        { name: 'Anand Patel', phone: '7654321098', address: 'Salem Region' },
        { name: 'Lakshmi Devi', phone: '6543210987', address: 'Madurai District' },
    ];

    customers.forEach(customer => {
        const existing = get('SELECT id FROM customers WHERE phone = ?', [customer.phone]);
        if (!existing) {
            run(
                'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
                [customer.name, customer.phone, customer.address]
            );
        }
    });

    const allCustomers: any[] = query('SELECT * FROM customers');

    // Create sample sales with dates spread over the last 30 days
    const salesData = [
        { daysAgo: 1, customer_idx: 0, notes: 'Regular customer - paid cash', items: [{ product_idx: 0, qty: 20 }, { product_idx: 4, qty: 5 }] },
        { daysAgo: 2, customer_idx: 1, notes: 'Bulk order for farming season', items: [{ product_idx: 1, qty: 30 }, { product_idx: 3, qty: 10 }] },
        { daysAgo: 3, customer_idx: null, notes: 'Walk-in customer', items: [{ product_idx: 2, qty: 15 }] },
        { daysAgo: 5, customer_idx: 2, notes: 'Repeat customer - discount given', items: [{ product_idx: 5, qty: 8 }, { product_idx: 6, qty: 12 }] },
        { daysAgo: 7, customer_idx: 3, notes: 'Festival season bulk purchase', items: [{ product_idx: 0, qty: 50 }, { product_idx: 4, qty: 20 }, { product_idx: 7, qty: 5 }] },
        { daysAgo: 10, customer_idx: 0, notes: 'Phone order delivery', items: [{ product_idx: 1, qty: 25 }] },
        { daysAgo: 12, customer_idx: 1, notes: 'Urgent order', items: [{ product_idx: 3, qty: 15 }] },
        { daysAgo: 15, customer_idx: null, notes: null, items: [{ product_idx: 2, qty: 10 }, { product_idx: 6, qty: 8 }] },
        { daysAgo: 18, customer_idx: 2, notes: 'Large wholesale order', items: [{ product_idx: 0, qty: 100 }, { product_idx: 1, qty: 80 }] },
        { daysAgo: 20, customer_idx: 3, notes: 'Monthly supply', items: [{ product_idx: 4, qty: 30 }, { product_idx: 7, qty: 10 }] },
        { daysAgo: 25, customer_idx: 0, notes: 'Pre-season stocking', items: [{ product_idx: 5, qty: 20 }] },
        { daysAgo: 28, customer_idx: null, notes: 'Cash sale', items: [{ product_idx: 3, qty: 5 }, { product_idx: 4, qty: 5 }] },
    ];

    salesData.forEach(sale => {
        // Calculate sale date
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - sale.daysAgo);
        const saleDateStr = saleDate.toISOString();

        // Calculate total amount
        let totalAmount = 0;
        sale.items.forEach(item => {
            if (products[item.product_idx]) {
                totalAmount += products[item.product_idx].price * item.qty;
            }
        });

        // Get customer ID
        const customerId = sale.customer_idx !== null && allCustomers[sale.customer_idx]
            ? allCustomers[sale.customer_idx].id
            : null;

        // Insert sale
        const result = run(
            'INSERT INTO sales (customer_id, total_amount, sale_date, notes, status) VALUES (?, ?, ?, ?, ?)',
            [customerId, totalAmount, saleDateStr, sale.notes, 'completed']
        );

        const saleId = result.lastInsertRowid;

        // Insert sale items
        sale.items.forEach(item => {
            if (products[item.product_idx]) {
                const product = products[item.product_idx];
                const itemTotal = product.price * item.qty;

                run(
                    'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                    [saleId, product.id, item.qty, product.price, itemTotal]
                );
            }
        });
    });

    console.log(`✅ Successfully seeded ${salesData.length} sales with items!`);

    // Show summary
    const totalSales: any = get('SELECT COUNT(*) as count, SUM(total_amount) as total FROM sales');
    console.log(`📊 Total sales: ${totalSales.count}, Total amount: Rs. ${totalSales.total.toFixed(2)}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedSalesData();
}
