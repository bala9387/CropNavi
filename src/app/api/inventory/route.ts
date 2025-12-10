import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const inventory = query('SELECT * FROM inventory ORDER BY transaction_date DESC');
    return NextResponse.json({ data: inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, transaction_type, quantity, reference_id, notes } = body;

    if (!product_id || !transaction_type || !quantity) {
      return NextResponse.json({ error: 'Product ID, transaction type, and quantity are required' }, { status: 400 });
    }

    const result = run('INSERT INTO inventory (product_id, transaction_type, quantity, reference_id, notes) VALUES (?, ?, ?, ?, ?)', [product_id, transaction_type, quantity, reference_id || null, notes || null]);

    // Update product stock
    if (transaction_type === 'purchase') {
      run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, product_id]);
    } else if (transaction_type === 'adjustment') {
      run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, product_id]);
    }

    const newInventory = get('SELECT * FROM inventory WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newInventory }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
