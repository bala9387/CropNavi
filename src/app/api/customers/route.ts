import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const customers = query('SELECT * FROM customers ORDER BY name');
    return NextResponse.json({ data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = run('INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)', [name, email || null, phone || null, address || null]);
    const newCustomer = get('SELECT * FROM customers WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newCustomer }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
