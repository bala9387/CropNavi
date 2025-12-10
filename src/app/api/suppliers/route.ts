import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const suppliers = query('SELECT * FROM suppliers ORDER BY name');
    return NextResponse.json({ data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
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

    const result = run('INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)', [name, email || null, phone || null, address || null]);
    const newSupplier = get('SELECT * FROM suppliers WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newSupplier }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
