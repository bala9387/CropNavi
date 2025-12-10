import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const setting = get('SELECT * FROM settings WHERE key = ?', [key]);
      return NextResponse.json({ data: setting });
    }

    const settings = query('SELECT * FROM settings ORDER BY key');
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, description } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const existing = get('SELECT id FROM settings WHERE key = ?', [key]);
    if (existing) {
      run('UPDATE settings SET value = ?, description = ? WHERE key = ?', [value || null, description || null, key]);
      const updated = get('SELECT * FROM settings WHERE key = ?', [key]);
      return NextResponse.json({ data: updated });
    } else {
      const result = run('INSERT INTO settings (key, value, description) VALUES (?, ?, ?)', [key, value || null, description || null]);
      const newSetting = get('SELECT * FROM settings WHERE id = ?', [result.lastInsertRowid]);
      return NextResponse.json({ data: newSetting }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
