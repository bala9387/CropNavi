import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const sale = get('SELECT * FROM sales WHERE id = ?', [id]);
      if (!sale) {
        return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
      }
      const items = query('SELECT * FROM sale_items WHERE sale_id = ?', [id]);
      return NextResponse.json({ data: { ...(sale as any), items } });
    }

    const sales = query('SELECT * FROM sales ORDER BY sale_date DESC');
    return NextResponse.json({ data: sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_id, items, total_amount, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Sale must have at least one item' }, { status: 400 });
    }

    // Start transaction
    const insertSale = run('INSERT INTO sales (customer_id, total_amount, notes) VALUES (?, ?, ?)', [customer_id || null, total_amount, notes || null]);
    const saleId = insertSale.lastInsertRowid;

    // Insert sale items
    for (const item of items as any[]) {
      run('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [saleId, item.product_id, item.quantity, item.unit_price, item.total_price]);

      // Update product stock
      run('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);

      // Record inventory transaction
      run('INSERT INTO inventory (product_id, transaction_type, quantity, reference_id) VALUES (?, ?, ?, ?)',
          [item.product_id, 'sale', -item.quantity, saleId]);
    }

    const sale = get('SELECT * FROM sales WHERE id = ?', [saleId]);
    const saleItems = query('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);

    return NextResponse.json({ data: { ...(sale as any), items: saleItems } }, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    const { customer_id, total_amount, status, notes } = body;

    const result = run(
      'UPDATE sales SET customer_id = ?, total_amount = ?, status = ?, notes = ? WHERE id = ?',
      [customer_id || null, total_amount, status || 'completed', notes || null, id]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    const updatedSale = get('SELECT * FROM sales WHERE id = ?', [id]);
    const items = query('SELECT * FROM sale_items WHERE sale_id = ?', [id]);

    return NextResponse.json({ data: { ...(updatedSale as any), items } });
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    // Get sale items to restore stock
    const items = query('SELECT * FROM sale_items WHERE sale_id = ?', [id]);
    for (const item of items as any[]) {
      run('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
      run('INSERT INTO inventory (product_id, transaction_type, quantity, reference_id) VALUES (?, ?, ?, ?)',
          [item.product_id, 'adjustment', item.quantity, id]);
    }

    run('DELETE FROM sale_items WHERE sale_id = ?', [id]);
    run('DELETE FROM sales WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
