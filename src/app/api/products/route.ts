import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const product = get('SELECT * FROM products WHERE id = ?', [id]);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ data: product });
    }

    const products = query('SELECT * FROM products WHERE is_active = 1 ORDER BY name');
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category_id, price, cost_price, sku, barcode, stock_quantity, low_stock_threshold } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const result = run(
      `INSERT INTO products (name, description, category_id, price, cost_price, sku, barcode, stock_quantity, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, category_id || null, price, cost_price || null, sku || null, barcode || null, stock_quantity || 0, low_stock_threshold || 10]
    );

    const newProduct = get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { name, description, category_id, price, cost_price, sku, barcode, stock_quantity, low_stock_threshold, is_active } = body;

    const result = run(
      `UPDATE products SET 
       name = ?, description = ?, category_id = ?, price = ?, cost_price = ?, sku = ?, barcode = ?, 
       stock_quantity = ?, low_stock_threshold = ?, is_active = ?
       WHERE id = ?`,
      [name, description || null, category_id || null, price, cost_price || null, sku || null, barcode || null,
       stock_quantity || 0, low_stock_threshold || 10, is_active !== undefined ? is_active : 1, id]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = get('SELECT * FROM products WHERE id = ?', [id]);
    return NextResponse.json({ data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const result = run('UPDATE products SET is_active = 0 WHERE id = ?', [id]);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
