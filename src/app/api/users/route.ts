import { NextRequest, NextResponse } from 'next/server';
import db, { run, query, get } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const users = query('SELECT id, username, role, created_at FROM users ORDER BY username');
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const result = run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role || 'user']);
    const newUser = get('SELECT id, username, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
