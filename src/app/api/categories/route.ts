import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const categories = query('SELECT * FROM categories ORDER BY name');
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null]);
    const newCategory = get('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
