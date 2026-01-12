
import { NextResponse } from 'next/server';
import { run, get } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        // Create user
        const result = run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'user']);

        // Fetch the new user to return (excluding password)
        const newUser = get('SELECT id, username, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);

        return NextResponse.json({ message: 'Signup successful', user: newUser }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
