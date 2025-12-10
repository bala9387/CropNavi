import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get('sale_id');

    if (saleId) {
      const payments = query('SELECT * FROM payments WHERE sale_id = ? ORDER BY payment_date', [saleId]);
      return NextResponse.json({ data: payments });
    }

    const payments = query('SELECT * FROM payments ORDER BY payment_date DESC');
    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sale_id, amount, payment_method, status } = body;

    if (!sale_id || !amount || !payment_method) {
      return NextResponse.json({ error: 'Sale ID, amount, and payment method are required' }, { status: 400 });
    }

    const result = run('INSERT INTO payments (sale_id, amount, payment_method, status) VALUES (?, ?, ?, ?)', [sale_id, amount, payment_method, status || 'paid']);
    const newPayment = get('SELECT * FROM payments WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newPayment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
